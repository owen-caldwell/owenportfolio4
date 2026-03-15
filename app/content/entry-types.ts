export type EntryTag =
  | "caseStudy"
  | "education"
  | "experimentation"
  | "archive";

export type EntryLayout = "article" | "gallery" | "custom";

export type EntryMenuPlacement = {
  homeWorkOrder?: number;
  socialOrder?: number;
  mobileFeaturedOrder?: number;
};

export type EntryFeaturedPlacement = {
  order: number;
  title?: string;
  summary: string;
  images: string[];
  imageAlt: string;
  actionText: string;
};

export type ArchiveListItem = {
  id: string;
  href: string;
  label: string;
  descriptor: string;
};

export type EntryBase = {
  id: string;
  title: string;
  href: string;
  hoverId: string;
  tag?: EntryTag;
  menuLabel?: string;
  isVisible?: boolean;
  menu?: EntryMenuPlacement;
  featured?: EntryFeaturedPlacement;
};

export type InternalEntry = EntryBase & {
  kind: "internal";
  slug: string;
  layout: EntryLayout;
  mdxPath: string;
};

export type ExternalEntry = EntryBase & {
  kind: "external";
};

export type ContentEntry = InternalEntry | ExternalEntry;
