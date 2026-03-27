import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import type { ContentEntry, EntryLayout, EntryTag } from "@/app/content/entry-types";
import { isLocalCmsEnabled } from "@/app/local-cms/allowed";

const ENTRIES_PATH = path.join(
  process.cwd(),
  "app/content/content-entries.json",
);
const VALID_LAYOUTS: EntryLayout[] = ["article", "gallery", "custom"];
const VALID_TAGS: EntryTag[] = ["caseStudy", "experimentation", "archive"];

function isExternalUrl(href: string) {
  return /^https?:\/\//.test(href);
}

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefined(item)) as T;
  }
  if (!value || typeof value !== "object") return value;

  const cleaned = Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, inner]) => {
      if (inner === undefined) return acc;
      const next = removeUndefined(inner);
      if (typeof next === "object" && next !== null && !Array.isArray(next)) {
        if (Object.keys(next).length === 0) return acc;
      }
      acc[key] = next;
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return cleaned as T;
}

/** Featured column uses only the first asset; trim extras so saves stay consistent. */
function normalizeFeaturedMedia(entries: ContentEntry[]) {
  for (const entry of entries) {
    if (!entry.featured?.media?.length) continue;
    entry.featured.media = [entry.featured.media[0]];
  }
}

function validateEntries(entries: ContentEntry[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const hoverIds = new Set<string>();
  const internalSlugs = new Set<string>();

  entries.forEach((entry, index) => {
    const prefix = `Entry ${index + 1} (${entry.id || "missing-id"})`;

    if (!entry.id?.trim()) errors.push(`${prefix}: id is required`);
    if (!entry.title?.trim()) errors.push(`${prefix}: title is required`);
    if (!entry.hoverId?.trim()) errors.push(`${prefix}: hoverId is required`);

    const href = entry.href?.trim();
    if (href) {
      if (
        entry.kind === "external" &&
        !isExternalUrl(href) &&
        !href.startsWith("/")
      ) {
        errors.push(
          `${prefix}: external href must be http(s) or an absolute path starting with /`,
        );
      }
      if (entry.kind === "internal" && !href.startsWith("/p/")) {
        errors.push(`${prefix}: internal href must start with /p/`);
      }
    }

    if (entry.id) {
      if (ids.has(entry.id)) errors.push(`${prefix}: duplicate id "${entry.id}"`);
      ids.add(entry.id);
    }
    if (entry.hoverId) {
      if (hoverIds.has(entry.hoverId)) {
        errors.push(`${prefix}: duplicate hoverId "${entry.hoverId}"`);
      }
      hoverIds.add(entry.hoverId);
    }

    if (entry.kind === "internal") {
      if (!entry.slug?.trim()) errors.push(`${prefix}: slug is required`);
      if (!VALID_LAYOUTS.includes(entry.layout)) {
        errors.push(`${prefix}: layout must be one of ${VALID_LAYOUTS.join(", ")}`);
      }
      if (entry.tag && !VALID_TAGS.includes(entry.tag)) {
        errors.push(`${prefix}: tag must be one of ${VALID_TAGS.join(", ")}`);
      }
      if (entry.slug) {
        if (internalSlugs.has(entry.slug)) {
          errors.push(`${prefix}: duplicate slug "${entry.slug}"`);
        }
        internalSlugs.add(entry.slug);
      }
    }

    if (entry.featured) {
      if (!entry.featured.summary?.trim()) {
        errors.push(`${prefix}: featured.summary is required`);
      }
      if (!entry.featured.imageAlt?.trim()) {
        errors.push(`${prefix}: featured.imageAlt is required`);
      }
      if (entry.featured.media.length !== 1) {
        errors.push(
          `${prefix}: featured.media must contain exactly one image or video`,
        );
      } else if (!entry.featured.media[0]?.src?.trim()) {
        errors.push(`${prefix}: featured.media[0].src is required`);
      }
    }
  });

  return errors;
}

export async function GET(request: NextRequest) {
  if (!isLocalCmsEnabled(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const raw = await fs.readFile(ENTRIES_PATH, "utf8");
  const entries = JSON.parse(raw) as ContentEntry[];
  return NextResponse.json({ entries });
}

export async function PUT(request: NextRequest) {
  if (!isLocalCmsEnabled(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const body = (await request.json()) as { entries?: ContentEntry[] };
  if (!Array.isArray(body.entries)) {
    return NextResponse.json({ error: "Payload must include an entries array." }, { status: 400 });
  }

  const cleanedEntries = removeUndefined(body.entries);
  normalizeFeaturedMedia(cleanedEntries);
  const errors = validateEntries(cleanedEntries);
  if (errors.length) {
    return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
  }

  await fs.writeFile(
    ENTRIES_PATH,
    `${JSON.stringify(cleanedEntries, null, 2)}\n`,
    "utf8",
  );

  return NextResponse.json({ ok: true, entries: cleanedEntries });
}
