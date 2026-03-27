"use client";

import { PAGE_TAG_COLORS, PAGE_TAG_LABELS, type PageTag } from "../page-tags";

const TAG_ORDER: PageTag[] = ["caseStudy", "experimentation", "archive"];

function ExternalArrowIcon({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className={className} fill="none">
      <path
        d="M2.5 9.5L9.5 2.5M4 2.5H9.5V8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type TagKeyProps = {
  className?: string;
};

/** Visible chip legend: dot + tag name (no hover-only disclosure). */
export default function TagKey({ className = "" }: TagKeyProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`.trim()}
      role="list"
      aria-label="Project type and external link tags"
    >
      {TAG_ORDER.map((tag) => (
        <div
          key={tag}
          role="listitem"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: PAGE_TAG_COLORS[tag] }}
            aria-hidden
          />
          <span>{PAGE_TAG_LABELS[tag]}</span>
        </div>
      ))}
      <div
        role="listitem"
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300"
      >
        <span className="inline-flex shrink-0 text-blue-500" aria-hidden>
          <ExternalArrowIcon />
        </span>
        <span>External</span>
      </div>
    </div>
  );
}
