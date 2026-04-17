import { getEntryByHoverId, getTagBySlug } from "./content/entries";
import type { EntryTag } from "./content/entry-types";

export const DEFAULT_ORB_COLOR = "#47a3f3";
export const EXTERNAL_LINK_ORB_COLOR = DEFAULT_ORB_COLOR;
export const INTERNAL_LINK_FALLBACK_ORB_COLOR = DEFAULT_ORB_COLOR;

export const PAGE_TAG_COLORS = {
  caseStudy: "#377d53",
  experimentation: "#c21f19",
  archive: "#f6c84a",
} as const;

export type PageTag = EntryTag;

export const PAGE_TAG_LABELS: Record<PageTag, string> = {
  caseStudy: "Case study",
  experimentation: "Experiment",
  archive: "Archive",
};

export function colorForTag(tag: PageTag | null | undefined): string {
  if (!tag) return INTERNAL_LINK_FALLBACK_ORB_COLOR;
  return PAGE_TAG_COLORS[tag];
}

export function colorForHref(href: string): string {
  if (/^https?:\/\//.test(href)) {
    return EXTERNAL_LINK_ORB_COLOR;
  }

  if (href.startsWith("/p/")) {
    const [, , slug] = href.split("/");
    return colorForTag(getTagBySlug(slug));
  }

  return INTERNAL_LINK_FALLBACK_ORB_COLOR;
}

export function colorForMenuHoverId(
  id: string | null | undefined,
): string | null {
  if (!id) return null;

  if (id.startsWith("featured-link-")) {
    return null;
  }

  const href = getEntryByHoverId(id)?.href;
  if (!href) return null;
  return colorForHref(href);
}
