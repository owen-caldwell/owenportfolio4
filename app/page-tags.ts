export const DEFAULT_ORB_COLOR = "#47a3f3";
export const EXTERNAL_LINK_ORB_COLOR = "#0ea5e9";
export const INTERNAL_LINK_FALLBACK_ORB_COLOR = "#8b8b8b";

export const PAGE_TAG_COLORS = {
  caseStudy: "#7c3aed",
  education: "#2563eb",
  experimentation: "#db2777",
  archive: "#ea580c",
} as const;

export type PageTag = keyof typeof PAGE_TAG_COLORS;

export const PAGE_TAG_BY_SLUG: Record<string, PageTag> = {
  "fda-redesign": "caseStudy",
  lacima: "education",
  seniorproject: "experimentation",
  "acc-final-project": "archive",
  nightflirt: "caseStudy",
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
    return colorForTag(slug ? PAGE_TAG_BY_SLUG[slug] : null);
  }

  return INTERNAL_LINK_FALLBACK_ORB_COLOR;
}
