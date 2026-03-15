import fs from "node:fs/promises";
import path from "node:path";
import type { EntryTag } from "./entry-types";

export type MdxManifestEntry = {
  slug: string;
  title: string | null;
  date: string | null;
  tag: EntryTag | null;
  path: string;
};

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "app", "p");

const TAG_VALUES = new Set<EntryTag>([
  "caseStudy",
  "education",
  "experimentation",
  "archive",
]);

function parseExportStringValue(source: string, name: string): string | null {
  const match = source.match(
    new RegExp(`export const ${name}\\s*=\\s*["'\`](.*?)["'\`]`, "m"),
  );
  return match?.[1] ?? null;
}

async function collectMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name === "page.mdx") {
      files.push(fullPath);
    }
  }

  return files;
}

function projectSlugFromPath(filePath: string) {
  const relativePath = path.relative(PROJECTS_DIR, filePath);
  const segments = relativePath.split(path.sep);
  return segments[0] ?? null;
}

export async function getMdxManifestEntries(): Promise<MdxManifestEntry[]> {
  const files = await collectMdxFiles(PROJECTS_DIR);
  const entries: MdxManifestEntry[] = [];

  for (const filePath of files) {
    const slug = projectSlugFromPath(filePath);
    if (!slug) continue;

    const source = await fs.readFile(filePath, "utf-8");
    const title = parseExportStringValue(source, "title");
    const date = parseExportStringValue(source, "date");
    const rawTag = parseExportStringValue(source, "tag");
    const tag = rawTag && TAG_VALUES.has(rawTag as EntryTag) ? (rawTag as EntryTag) : null;

    entries.push({
      slug,
      title,
      date,
      tag,
      path: path.relative(ROOT, filePath),
    });
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}
