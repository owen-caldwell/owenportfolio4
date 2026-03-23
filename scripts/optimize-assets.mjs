#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const CACHE_FILE = path.join(ROOT, ".asset-optimize-cache.json");
const CACHE_VERSION = "v2";
const TEMP_FILE_PREFIX = ".tmp-opt-";
const FFMPEG_TIMEOUT_MS = 120_000;
const CWEBP_TIMEOUT_MS = 60_000;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
let cachedFfmpegHasWebpEncoder = null;
let cachedHasCwebp = null;

function runFfmpeg(args) {
  const result = spawnSync("ffmpeg", args, {
    stdio: "pipe",
    encoding: "utf-8",
    timeout: FFMPEG_TIMEOUT_MS,
  });
  if (result.error?.code === "ETIMEDOUT") {
    throw new Error(`ffmpeg timed out after ${FFMPEG_TIMEOUT_MS}ms`);
  }
  if (result.status === 0) return;
  const errorOutput = result.stderr || result.stdout || "Unknown ffmpeg error";
  throw new Error(errorOutput.trim());
}

function runCwebp(args) {
  const result = spawnSync("cwebp", args, {
    stdio: "pipe",
    encoding: "utf-8",
    timeout: CWEBP_TIMEOUT_MS,
  });
  if (result.error?.code === "ETIMEDOUT") {
    throw new Error(`cwebp timed out after ${CWEBP_TIMEOUT_MS}ms`);
  }
  if (result.status === 0) return;
  const errorOutput = result.stderr || result.stdout || "Unknown cwebp error";
  throw new Error(errorOutput.trim());
}

function ensureFfmpeg() {
  const result = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (result.status !== 0) {
    throw new Error("ffmpeg is required but not found on PATH.");
  }
}

function ffmpegHasWebpEncoder() {
  if (cachedFfmpegHasWebpEncoder !== null) return cachedFfmpegHasWebpEncoder;
  const result = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], {
    stdio: "pipe",
    encoding: "utf-8",
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  cachedFfmpegHasWebpEncoder = /\blibwebp\b/.test(output);
  return cachedFfmpegHasWebpEncoder;
}

function hasCwebp() {
  if (cachedHasCwebp !== null) return cachedHasCwebp;
  const result = spawnSync("cwebp", ["-version"], { stdio: "ignore" });
  cachedHasCwebp = result.status === 0;
  return cachedHasCwebp;
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(TEMP_FILE_PREFIX)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function isRecoverableVideoError(error) {
  const message =
    (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    message.includes("moov atom not found") ||
    message.includes("invalid data found when processing input") ||
    message.includes("error while decoding stream") ||
    message.includes("timed out")
  );
}

async function fileHash(filePath) {
  const content = await fs.readFile(filePath);
  return createHash("sha1").update(content).digest("hex");
}

function tempOutputPath(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  return path.join(dir, `.tmp-opt-${process.pid}-${Date.now()}-${base}`);
}

async function optimizeImage(filePath, ext) {
  const parsed = path.parse(filePath);
  const targetPath =
    ext === ".webp" ? filePath : path.join(parsed.dir, `${parsed.name}.webp`);
  const outPath = tempOutputPath(targetPath);

  if (targetPath !== filePath && existsSync(targetPath)) {
    throw new Error(
      `Cannot convert "${path.relative(ROOT, filePath)}" to webp because "${path.relative(ROOT, targetPath)}" already exists.`,
    );
  }

  if (ffmpegHasWebpEncoder()) {
    runFfmpeg([
      "-y",
      "-i",
      filePath,
      "-vf",
      "scale='min(2560,iw)':-2",
      "-c:v",
      "libwebp",
      "-q:v",
      "75",
      "-compression_level",
      "6",
      outPath,
    ]);
  } else if (hasCwebp()) {
    runCwebp(["-q", "75", "-m", "6", "-mt", filePath, "-o", outPath]);
  } else {
    throw new Error(
      'Cannot produce .webp files: ffmpeg lacks "libwebp" and "cwebp" is not installed. Install webp (e.g. "brew install webp").',
    );
  }

  await fs.rename(outPath, targetPath);
  if (targetPath !== filePath) {
    await fs.unlink(filePath);
  }

  return targetPath;
}

async function optimizeVideo(filePath, ext) {
  const outPath = tempOutputPath(filePath);

  if (ext === ".webm") {
    runFfmpeg([
      "-y",
      "-i",
      filePath,
      "-c:v",
      "libvpx-vp9",
      "-crf",
      "32",
      "-b:v",
      "0",
      "-c:a",
      "libopus",
      "-b:a",
      "96k",
      outPath,
    ]);
  } else {
    runFfmpeg([
      "-y",
      "-i",
      filePath,
      "-vf",
      "scale='min(1920,iw)':-2,fps=30",
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-level:v",
      "4.1",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "slow",
      "-crf",
      "20",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      outPath,
    ]);
  }

  await fs.rename(outPath, filePath);
}

async function generatePosterFromVideo(videoPath) {
  const parsed = path.parse(videoPath);
  const posterPath = path.join(parsed.dir, `${parsed.name}.poster.webp`);
  if (existsSync(posterPath)) return { generated: false, posterPath };

  if (ffmpegHasWebpEncoder()) {
    runFfmpeg([
      "-y",
      "-ss",
      "00:00:00.500",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(1920,iw)':-2",
      "-c:v",
      "libwebp",
      "-q:v",
      "75",
      posterPath,
    ]);
  } else if (hasCwebp()) {
    const tempFramePath = tempOutputPath(
      path.join(parsed.dir, `${parsed.name}.poster-frame.png`),
    );
    runFfmpeg([
      "-y",
      "-ss",
      "00:00:00.500",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(1920,iw)':-2",
      tempFramePath,
    ]);
    try {
      runCwebp(["-q", "75", "-m", "6", "-mt", tempFramePath, "-o", posterPath]);
    } finally {
      if (existsSync(tempFramePath)) {
        await fs.unlink(tempFramePath);
      }
    }
  } else {
    throw new Error(
      `Cannot generate poster for "${path.relative(ROOT, videoPath)}": ffmpeg lacks "libwebp" and "cwebp" is not installed.`,
    );
  }

  return { generated: true, posterPath };
}

async function readCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await fs.writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
}

async function main() {
  ensureFfmpeg();

  if (!existsSync(PUBLIC_DIR)) {
    console.log("No public directory found, skipping asset optimization.");
    return;
  }

  const cache = await readCache();
  const files = await walkFiles(PUBLIC_DIR);
  const nextCache = {};

  let optimizedImages = 0;
  let optimizedVideos = 0;
  let generatedPosters = 0;
  let skipped = 0;
  let recoverableVideoErrors = 0;

  for (const filePath of files) {
    const relPath = path.relative(ROOT, filePath);
    const ext = path.extname(filePath).toLowerCase();
    const isImage = IMAGE_EXTENSIONS.has(ext);
    const isVideo = VIDEO_EXTENSIONS.has(ext);

    if (!isImage && !isVideo) continue;

    const inputHash = await fileHash(filePath);
    const cacheKey = `${CACHE_VERSION}:${relPath}`;
    const cached = cache[cacheKey];

    if (cached?.inputHash === inputHash) {
      skipped += 1;
      nextCache[cacheKey] = cached;
      continue;
    }

    if (isImage) {
      const optimizedPath = await optimizeImage(filePath, ext);
      optimizedImages += 1;
      const outputRelPath = path.relative(ROOT, optimizedPath);
      const outputHash = await fileHash(optimizedPath);
      nextCache[`${CACHE_VERSION}:${outputRelPath}`] = { inputHash: outputHash };
      if (optimizedPath === filePath) {
        console.log(`optimized image: ${relPath}`);
      } else {
        console.log(`optimized image: ${relPath} -> ${outputRelPath}`);
      }
      continue;
    }

    try {
      await optimizeVideo(filePath, ext);
      optimizedVideos += 1;
      const { generated } = await generatePosterFromVideo(filePath);
      if (generated) generatedPosters += 1;
      const outputHash = await fileHash(filePath);
      nextCache[cacheKey] = { inputHash: outputHash };
      console.log(
        `optimized video: ${relPath}${generated ? " (poster generated)" : ""}`,
      );
    } catch (error) {
      if (!isRecoverableVideoError(error)) throw error;
      recoverableVideoErrors += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `skipped invalid video: ${relPath} (${message.split("\n")[0]})`,
      );
      // Cache current hash so the optimizer does not repeatedly fail
      // on the same broken file every run.
      nextCache[cacheKey] = { inputHash };
    }
  }

  await writeCache(nextCache);

  console.log(
    `asset optimization done: ${optimizedImages} images, ${optimizedVideos} videos, ${generatedPosters} posters generated, ${skipped} skipped`,
  );
  if (recoverableVideoErrors > 0) {
    console.warn(
      `asset optimization warnings: ${recoverableVideoErrors} invalid video file(s) were skipped`,
    );
  }
}

main().catch((error) => {
  console.error("asset optimization failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
