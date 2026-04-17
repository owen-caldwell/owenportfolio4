#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_FILE = path.join(ROOT, "app/content/blur-placeholders.json");
const CACHE_FILE = path.join(ROOT, ".blur-placeholders-cache.json");
const CACHE_VERSION = "v1";
const THUMB_WIDTH = 16;
const JPEG_QUALITY = 40;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function fileHash(filePath) {
  const content = await fs.readFile(filePath);
  return createHash("sha1").update(content).digest("hex");
}

function publicUrlKey(filePath) {
  const rel = path.relative(PUBLIC_DIR, filePath);
  return `/${rel.split(path.sep).join("/")}`;
}

/**
 * SVG blur-up wrapper (same idea as the-blur-up-technique CodePen): tiny JPEG
 * scaled to full dimensions with feGaussianBlur.
 */
function buildBlurDataUrl(jpegBase64, origWidth, origHeight) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${origWidth}" height="${origHeight}" viewBox="0 0 ${origWidth} ${origHeight}">
  <filter id="b" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="20" />
    <feComponentTransfer>
      <feFuncA type="discrete" tableValues="1 1" />
    </feComponentTransfer>
  </filter>
  <image filter="url(#b)" xlink:href="data:image/jpeg;base64,${jpegBase64}" x="0" y="0" width="100%" height="100%" />
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function generateEntry(filePath) {
  const meta = await sharp(filePath).metadata();
  const origWidth = meta.width;
  const origHeight = meta.height;
  if (
    origWidth == null ||
    origHeight == null ||
    origWidth < 1 ||
    origHeight < 1
  ) {
    throw new Error(`missing dimensions: ${path.relative(ROOT, filePath)}`);
  }

  const thumb = await sharp(filePath)
    .resize({
      width: THUMB_WIDTH,
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const jpegBase64 = thumb.toString("base64");
  const dataURL = buildBlurDataUrl(jpegBase64, origWidth, origHeight);

  return { dataURL, width: origWidth, height: origHeight };
}

async function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) {
    console.warn("No public/ directory; writing empty blur-placeholders.json.");
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.writeFile(OUTPUT_FILE, "{}\n", "utf-8");
    return;
  }

  const oldManifest = await readJson(OUTPUT_FILE, {});
  const rawCache = await readJson(CACHE_FILE, {});
  const cache = rawCache.version === CACHE_VERSION ? rawCache.entries ?? {} : {};

  const files = (await walkFiles(PUBLIC_DIR)).filter((p) =>
    IMAGE_EXTENSIONS.has(path.extname(p).toLowerCase()),
  );

  const nextManifest = {};
  const nextCache = {};

  let generated = 0;
  let reused = 0;

  for (const filePath of files) {
    const key = publicUrlKey(filePath);
    const hash = await fileHash(filePath);
    const cacheKey = `${CACHE_VERSION}:${key}`;

    if (cache[cacheKey] === hash && oldManifest[key]) {
      nextManifest[key] = oldManifest[key];
      nextCache[cacheKey] = hash;
      reused += 1;
      continue;
    }

    nextManifest[key] = await generateEntry(filePath);
    nextCache[cacheKey] = hash;
    generated += 1;
    console.log(`blur placeholder: ${key}`);
  }

  const sortedKeys = Object.keys(nextManifest).sort();
  const ordered = {};
  for (const k of sortedKeys) {
    ordered[k] = nextManifest[k];
  }

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(ordered, null, 2)}\n`,
    "utf-8",
  );
  await fs.writeFile(
    CACHE_FILE,
    `${JSON.stringify({ version: CACHE_VERSION, entries: nextCache }, null, 2)}\n`,
    "utf-8",
  );

  console.log(
    `blur placeholders done: ${generated} generated, ${reused} reused (${sortedKeys.length} total)`,
  );
}

main().catch((error) => {
  console.error("generate-blur-placeholders failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
