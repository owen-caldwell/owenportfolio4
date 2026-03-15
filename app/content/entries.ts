import { ARCHIVE_ITEMS } from "./archive-items";
import { EXTERNAL_ENTRIES } from "./external-entries";
import { INTERNAL_ENTRIES } from "./internal-entries";
import type {
  ArchiveListItem,
  ContentEntry,
  EntryLayout,
  EntryTag,
} from "./entry-types";

const ALL_ENTRIES: ContentEntry[] = [...INTERNAL_ENTRIES, ...EXTERNAL_ENTRIES];

function sortByOrder<T>(
  values: T[],
  getOrder: (value: T) => number | undefined,
): T[] {
  return [...values].sort((a, b) => {
    const orderA = getOrder(a);
    const orderB = getOrder(b);

    if (orderA === undefined && orderB === undefined) return 0;
    if (orderA === undefined) return 1;
    if (orderB === undefined) return -1;
    return orderA - orderB;
  });
}

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
  const workEntries = getAllEntries().filter(
    (entry) => entry.menu?.homeWorkOrder !== undefined,
  );
  return sortByOrder(workEntries, (entry) => entry.menu?.homeWorkOrder);
}

export function getSocialEntries(): ContentEntry[] {
  const socialEntries = getAllEntries().filter(
    (entry) => entry.menu?.socialOrder !== undefined,
  );
  return sortByOrder(socialEntries, (entry) => entry.menu?.socialOrder);
}

export function getArchiveEntries(): ArchiveListItem[] {
  return [...ARCHIVE_ITEMS];
}

export function getMobileFeaturedMenuEntries(): ContentEntry[] {
  const mobileEntries = getAllEntries().filter(
    (entry) => entry.menu?.mobileFeaturedOrder !== undefined,
  );
  return sortByOrder(mobileEntries, (entry) => entry.menu?.mobileFeaturedOrder);
}

export function getFeaturedEntries(): ContentEntry[] {
  const featuredEntries = getAllEntries().filter(
    (entry) => entry.featured !== undefined,
  );
  return sortByOrder(featuredEntries, (entry) => entry.featured?.order);
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
