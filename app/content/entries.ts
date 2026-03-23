import { ARCHIVE_ITEMS } from "./archive-items";
import { CONTENT_ENTRIES } from "./content-entries";
import type {
  ArchiveListItem,
  ContentEntry,
  EntryLayout,
  EntryTag,
} from "./entry-types";

const ALL_ENTRIES: ContentEntry[] = CONTENT_ENTRIES;

export function getAllEntries(): ContentEntry[] {
  return ALL_ENTRIES.filter((entry) => entry.isVisible !== false);
}

export function getInternalEntries() {
  return getAllEntries().filter(
    (entry): entry is Extract<ContentEntry, { kind: "internal" }> =>
      entry.kind === "internal",
  );
}

export function getExternalEntries() {
  return getAllEntries().filter(
    (entry): entry is Extract<ContentEntry, { kind: "external" }> =>
      entry.kind === "external",
  );
}

export function getHomeWorkEntries(): ContentEntry[] {
  return getAllEntries().filter((entry) => entry.menu?.homeWork === true);
}

export function getSocialEntries(): ContentEntry[] {
  return getAllEntries().filter((entry) => entry.menu?.social === true);
}

export function getClientEntries(): ContentEntry[] {
  return getAllEntries().filter((entry) => entry.menu?.client === true);
}

export function getArchiveEntries(): ArchiveListItem[] {
  return [...ARCHIVE_ITEMS];
}

export function getMobileFeaturedMenuEntries(): ContentEntry[] {
  return getAllEntries().filter((entry) => entry.menu?.mobileFeatured === true);
}

export function getFeaturedEntries(): ContentEntry[] {
  return getAllEntries().filter((entry) => entry.featured !== undefined);
}

export function getEntryByHoverId(id: string | null | undefined) {
  if (!id) return null;
  return getAllEntries().find((entry) => entry.hoverId === id) ?? null;
}

export function getEntryBySlug(slug: string | null | undefined) {
  if (!slug) return null;
  return getInternalEntries().find((entry) => entry.slug === slug) ?? null;
}

export function getEntryByHref(href: string | null | undefined) {
  if (!href) return null;
  return getAllEntries().find((entry) => entry.href === href) ?? null;
}

export function getFeaturedEntryByHoverId(id: string | null | undefined) {
  const entry = getEntryByHoverId(id);
  if (!entry?.featured) return null;
  return entry;
}

export function getFeaturedLinkIdByHoverId(id: string | null | undefined) {
  if (!id) return null;
  const featuredEntries = getFeaturedEntries();
  const index = featuredEntries.findIndex((entry) => entry.hoverId === id);
  if (index < 0) return null;
  return `featured-link-${index}`;
}

export function getHoverIdByFeaturedLinkId(id: string | null | undefined) {
  if (!id || !id.startsWith("featured-link-")) return null;
  const index = Number(id.replace("featured-link-", ""));
  if (!Number.isFinite(index)) return null;
  const entry = getFeaturedEntries()[index];
  return entry?.hoverId ?? null;
}

export function getFeaturedHrefByLinkId(id: string | null | undefined) {
  if (!id || !id.startsWith("featured-link-")) return null;
  const index = Number(id.replace("featured-link-", ""));
  if (!Number.isFinite(index)) return null;
  const entry = getFeaturedEntries()[index];
  return entry?.href ?? null;
}

export function getTagBySlug(slug: string | null | undefined): EntryTag | null {
  const entry = getEntryBySlug(slug);
  return entry?.tag ?? null;
}

export function getLayoutBySlug(slug: string | null | undefined): EntryLayout {
  const entry = getEntryBySlug(slug);
  return entry?.layout ?? "article";
}
