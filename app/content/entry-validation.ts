import { getAllEntries, getInternalEntries } from "./entries";
import type { EntryLayout } from "./entry-types";
import type { MdxManifestEntry } from "./mdx-manifest";

function duplicates(values: string[]) {
  const seen = new Set<string>();
  const dupes = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }

  return [...dupes];
}

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

const VALID_LAYOUTS: EntryLayout[] = ["article", "gallery", "custom"];

export function validateStaticEntries(): string[] {
  const errors: string[] = [];
  const entries = getAllEntries();
  const internalEntries = getInternalEntries();

  const duplicateIds = duplicates(entries.map((entry) => entry.id));
  if (duplicateIds.length) {
    errors.push(`Duplicate entry ids: ${duplicateIds.join(", ")}`);
  }

  const duplicateHoverIds = duplicates(entries.map((entry) => entry.hoverId));
  if (duplicateHoverIds.length) {
    errors.push(`Duplicate hover ids: ${duplicateHoverIds.join(", ")}`);
  }

  const duplicateSlugs = duplicates(internalEntries.map((entry) => entry.slug));
  if (duplicateSlugs.length) {
    errors.push(`Duplicate internal slugs: ${duplicateSlugs.join(", ")}`);
  }

  for (const entry of entries) {
    const href = entry.href?.trim();
    if (
      entry.kind === "external" &&
      href &&
      !isExternalUrl(href) &&
      !href.startsWith("/")
    ) {
      errors.push(
        `External entry "${entry.id}" has invalid href "${entry.href}"`,
      );
    }
    if (entry.kind === "internal" && href && !href.startsWith("/p/")) {
      errors.push(`Internal entry "${entry.id}" should use /p/ href`);
    }
    if (entry.kind === "internal" && !VALID_LAYOUTS.includes(entry.layout)) {
      errors.push(
        `Internal entry "${entry.id}" has invalid layout "${entry.layout}"`,
      );
    }
    if (entry.featured) {
      if (entry.featured.media.length !== 1) {
        errors.push(
          `Featured entry "${entry.id}" must include exactly one featured.media item`,
        );
      }
      if (!entry.featured.summary.trim()) {
        errors.push(`Featured entry "${entry.id}" must include a summary`);
      }
    }
  }

  return errors;
}

export function validateAgainstMdxManifest(
  manifest: MdxManifestEntry[],
): string[] {
  const errors: string[] = [];
  const internalEntries = getInternalEntries();
  const manifestBySlug = new Map(manifest.map((entry) => [entry.slug, entry]));

  for (const entry of internalEntries) {
    if (!entry.mdxPath?.trim()) continue;
    const mdx = manifestBySlug.get(entry.slug);
    if (!mdx) {
      errors.push(
        `Internal entry "${entry.slug}" is missing from MDX manifest`,
      );
      continue;
    }
    if (entry.tag && mdx.tag && entry.tag !== mdx.tag) {
      errors.push(
        `Tag mismatch for "${entry.slug}": registry=${entry.tag}, mdx=${mdx.tag}`,
      );
    }
  }

  return errors;
}
