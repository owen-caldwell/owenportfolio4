import type { ExternalEntry } from "./entry-types";

export const EXTERNAL_ENTRIES: ExternalEntry[] = [
  {
    kind: "external",
    id: "project-finn",
    href: "https://finn-crawford.com",
    hoverId: "work-finn",
    title: "Finn Crawford",
    menuLabel: "Finn Crawford's Portfolio Website",
    menu: {
      homeWorkOrder: 4,
    },
    featured: {
      order: 3,
      title: "Finn Crawford",
      summary: "Design & Development, Portfolio",
      images: ["/featured/finncrawford.png"],
      imageAlt: "a portfolio website with a gallery of images.",
      actionText: "Visit website",
    },
  },
  {
    kind: "external",
    id: "project-jenna",
    href: "https://www.jennaferayo.com",
    hoverId: "featured-jenna",
    title: "Jenna Ferayo",
    featured: {
      order: 2,
      title: "Jenna Ferayo",
      summary: "Design & Development, Portfolio",
      images: ["/featured/jennaferayo.png"],
      imageAlt: "A portfolio site screenshot.",
      actionText: "Visit website",
    },
  },
  {
    kind: "external",
    id: "project-hunter",
    href: "https://www.huntkats.com",
    hoverId: "featured-hunter",
    title: "Hunter Mathews",
    featured: {
      order: 4,
      title: "Hunter Mathews",
      summary: "Design & Development, Portfolio",
      images: ["/featured/huntermathews.png"],
      imageAlt: "a portfolio website with a gallery of images.",
      actionText: "Visit website",
    },
  },
  {
    kind: "external",
    id: "social-linkedin",
    href: "https://www.linkedin.com/in/owencaldwell/",
    hoverId: "social-linkedin",
    title: "LinkedIn",
    menuLabel: "LinkedIn",
    menu: {
      socialOrder: 1,
    },
  },
  {
    kind: "external",
    id: "social-resume",
    href: "/caldwell-resume.pdf",
    hoverId: "social-resume",
    title: "Resume",
    menuLabel: "Resume",
    menu: {
      socialOrder: 2,
    },
  },
];
