"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentEntry, EntryLayout, EntryTag } from "@/app/content/entry-types";

type ApiResponse = {
  entries: ContentEntry[];
  error?: string;
  errors?: string[];
};

const EMPTY_INTERNAL: ContentEntry = {
  kind: "internal",
  id: "",
  slug: "",
  href: "/p/",
  hoverId: "",
  title: "",
  layout: "article",
  mdxPath: "app/p/new-slug/page.mdx",
};

const EMPTY_EXTERNAL: ContentEntry = {
  kind: "external",
  id: "",
  href: "https://",
  hoverId: "",
  title: "",
};

const LAYOUTS: EntryLayout[] = ["article", "gallery", "custom"];
const TAGS: EntryTag[] = ["caseStudy", "education", "experimentation", "archive"];

function cloneEntries(entries: ContentEntry[]) {
  return JSON.parse(JSON.stringify(entries)) as ContentEntry[];
}

export default function LocalCmsClient() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const selectedEntry = entries[selectedIndex];

  const filteredIndexes = useMemo(() => {
    if (!query.trim()) return entries.map((_, index) => index);
    const q = query.toLowerCase();
    return entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) =>
        [entry.id, entry.title, entry.kind, entry.hoverId].some((value) =>
          value.toLowerCase().includes(q),
        ),
      )
      .map(({ index }) => index);
  }, [entries, query]);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/local-cms/entries", {
        cache: "no-store",
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        setStatus(data.error ?? "Failed to load entries.");
        setLoading(false);
        return;
      }
      setEntries(data.entries);
      setLoading(false);
    })();
  }, []);

  function updateSelected(mutator: (entry: ContentEntry) => ContentEntry) {
    setEntries((prev) => {
      const next = cloneEntries(prev);
      next[selectedIndex] = mutator(next[selectedIndex]);
      return next;
    });
  }

  function moveSelected(direction: -1 | 1) {
    setEntries((prev) => {
      const target = selectedIndex + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = cloneEntries(prev);
      const [item] = next.splice(selectedIndex, 1);
      next.splice(target, 0, item);
      setSelectedIndex(target);
      return next;
    });
  }

  function addEntry(kind: "internal" | "external") {
    const timestamp = Date.now().toString(36);
    const nextEntry =
      kind === "internal"
        ? {
            ...EMPTY_INTERNAL,
            id: `project-new-${timestamp}`,
            slug: `new-${timestamp}`,
            href: `/p/new-${timestamp}`,
            hoverId: `hover-new-${timestamp}`,
            title: "New Internal Project",
            mdxPath: `app/p/new-${timestamp}/page.mdx`,
          }
        : {
            ...EMPTY_EXTERNAL,
            id: `external-new-${timestamp}`,
            hoverId: `hover-new-${timestamp}`,
            title: "New External Link",
          };

    setEntries((prev) => {
      const next = [...prev, nextEntry];
      setSelectedIndex(next.length - 1);
      return next;
    });
    setStatus(null);
    setErrors([]);
  }

  function deleteSelected() {
    if (!selectedEntry) return;
    if (!window.confirm(`Delete "${selectedEntry.title}"?`)) return;
    setEntries((prev) => {
      const next = prev.filter((_, idx) => idx !== selectedIndex);
      const safeIndex = Math.max(0, Math.min(selectedIndex, next.length - 1));
      setSelectedIndex(safeIndex);
      return next;
    });
    setStatus(null);
    setErrors([]);
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    setErrors([]);
    const response = await fetch("/api/local-cms/entries", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries }),
    });
    const data = (await response.json()) as ApiResponse;
    setSaving(false);
    if (!response.ok) {
      setStatus(data.error ?? "Failed to save.");
      setErrors(data.errors ?? []);
      return;
    }
    setEntries(data.entries);
    setStatus("Saved to app/content/content-entries.json");
  }

  if (loading) {
    return <div className="py-8">Loading local CMS...</div>;
  }

  if (!entries.length) {
    return (
      <div className="py-8">
        <p>No entries found.</p>
        <button
          type="button"
          onClick={() => addEntry("internal")}
          className="mt-4 rounded border px-3 py-1.5"
        >
          Add first internal entry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 py-6 md:grid-cols-[340px_1fr]">
      <aside className="space-y-3">
        <h1 className="text-xl font-semibold">Local CMS</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Local-only editor for content entries. Order in this list controls menu
          and featured order.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search entries..."
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <div className="max-h-[62vh] space-y-1 overflow-y-auto rounded border p-2">
          {filteredIndexes.map((index) => {
            const entry = entries[index];
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`block w-full rounded px-2 py-2 text-left text-sm ${
                  selectedIndex === index
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="font-medium">{entry.title}</div>
                <div className="opacity-75">
                  {entry.kind} - {entry.id}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addEntry("internal")}
            className="rounded border px-2 py-1 text-sm"
          >
            + Internal
          </button>
          <button
            type="button"
            onClick={() => addEntry("external")}
            className="rounded border px-2 py-1 text-sm"
          >
            + External
          </button>
        </div>
      </aside>

      <section className="space-y-4 rounded border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => moveSelected(-1)}
            disabled={selectedIndex === 0}
            className="rounded border px-2 py-1 text-sm disabled:opacity-40"
          >
            Move Up
          </button>
          <button
            type="button"
            onClick={() => moveSelected(1)}
            disabled={selectedIndex === entries.length - 1}
            className="rounded border px-2 py-1 text-sm disabled:opacity-40"
          >
            Move Down
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            className="rounded border px-2 py-1 text-sm text-red-700 dark:text-red-300"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="ml-auto rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {status && (
          <p className="rounded bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
            {status}
          </p>
        )}
        {!!errors.length && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Kind
            <input
              value={selectedEntry.kind}
              disabled
              className="mt-1 w-full rounded border px-3 py-2 text-sm opacity-70"
            />
          </label>
          <label className="text-sm">
            ID
            <input
              value={selectedEntry.id}
              onChange={(event) =>
                updateSelected((entry) => ({ ...entry, id: event.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Title
            <input
              value={selectedEntry.title}
              onChange={(event) =>
                updateSelected((entry) => ({
                  ...entry,
                  title: event.target.value,
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Menu label (optional)
            <input
              value={selectedEntry.menuLabel ?? ""}
              onChange={(event) =>
                updateSelected((entry) => ({
                  ...entry,
                  menuLabel: event.target.value || undefined,
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Href (optional)
            <input
              value={selectedEntry.href ?? ""}
              onChange={(event) =>
                updateSelected((entry) => ({
                  ...entry,
                  href: event.target.value || undefined,
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Hover ID
            <input
              value={selectedEntry.hoverId}
              onChange={(event) =>
                updateSelected((entry) => ({
                  ...entry,
                  hoverId: event.target.value,
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </label>
        </div>

        {selectedEntry.kind === "internal" && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Slug
              <input
                value={selectedEntry.slug}
                onChange={(event) =>
                  updateSelected((entry) =>
                    entry.kind === "internal"
                      ? { ...entry, slug: event.target.value }
                      : entry,
                  )
                }
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              MDX path (optional if no case-study page)
              <input
                value={selectedEntry.mdxPath ?? ""}
                onChange={(event) =>
                  updateSelected((entry) =>
                    entry.kind === "internal"
                      ? {
                          ...entry,
                          mdxPath: event.target.value || undefined,
                        }
                      : entry,
                  )
                }
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              Layout
              <select
                value={selectedEntry.layout}
                onChange={(event) =>
                  updateSelected((entry) =>
                    entry.kind === "internal"
                      ? { ...entry, layout: event.target.value as EntryLayout }
                      : entry,
                  )
                }
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              >
                {LAYOUTS.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Tag (optional)
              <select
                value={selectedEntry.tag ?? ""}
                onChange={(event) =>
                  updateSelected((entry) =>
                    entry.kind === "internal"
                      ? { ...entry, tag: (event.target.value as EntryTag) || undefined }
                      : entry,
                  )
                }
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="space-y-2 rounded border p-3">
          <h2 className="text-sm font-semibold">Placement</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {(
              [
                ["homeWork", "Home work"],
                ["client", "Client"],
                ["social", "Social"],
                ["mobileFeatured", "Mobile featured"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedEntry.menu?.[key] === true}
                  onChange={(event) =>
                    updateSelected((entry) => ({
                      ...entry,
                      menu: {
                        ...(entry.menu ?? {}),
                        [key]: event.target.checked || undefined,
                      },
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded border p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Featured Card</h2>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(selectedEntry.featured)}
                onChange={(event) =>
                  updateSelected((entry) => ({
                    ...entry,
                    featured: event.target.checked
                      ? {
                          title: entry.title,
                          summary: "",
                          media: [{ src: "" }],
                          imageAlt: "",
                          actionText: "",
                        }
                      : undefined,
                  }))
                }
              />
              Enabled
            </label>
          </div>

          {selectedEntry.featured && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Featured title (optional)
                  <input
                    value={selectedEntry.featured.title ?? ""}
                    onChange={(event) =>
                      updateSelected((entry) => ({
                        ...entry,
                        featured: entry.featured
                          ? { ...entry.featured, title: event.target.value || undefined }
                          : entry.featured,
                      }))
                    }
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm">
                  Action text (optional; omit button if empty)
                  <input
                    value={selectedEntry.featured.actionText ?? ""}
                    onChange={(event) =>
                      updateSelected((entry) => ({
                        ...entry,
                        featured: entry.featured
                          ? {
                              ...entry.featured,
                              actionText: event.target.value || undefined,
                            }
                          : entry.featured,
                      }))
                    }
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block text-sm">
                Summary
                <textarea
                  value={selectedEntry.featured.summary}
                  onChange={(event) =>
                    updateSelected((entry) => ({
                      ...entry,
                      featured: entry.featured
                        ? { ...entry.featured, summary: event.target.value }
                        : entry.featured,
                    }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                Image alt
                <textarea
                  value={selectedEntry.featured.imageAlt}
                  onChange={(event) =>
                    updateSelected((entry) => ({
                      ...entry,
                      featured: entry.featured
                        ? { ...entry.featured, imageAlt: event.target.value }
                        : entry.featured,
                    }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Media</h3>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected((entry) => ({
                        ...entry,
                        featured: entry.featured
                          ? {
                              ...entry.featured,
                              media: [...entry.featured.media, { src: "" }],
                            }
                          : entry.featured,
                      }))
                    }
                    className="rounded border px-2 py-1 text-sm"
                  >
                    + Media
                  </button>
                </div>
                {selectedEntry.featured.media.map((media, mediaIndex) => (
                  <div
                    key={`${selectedEntry.id}-media-${mediaIndex}`}
                    className="grid gap-2 rounded border p-2 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      value={media.src}
                      onChange={(event) =>
                        updateSelected((entry) => ({
                          ...entry,
                          featured: entry.featured
                            ? {
                                ...entry.featured,
                                media: entry.featured.media.map((item, idx) =>
                                  idx === mediaIndex
                                    ? { ...item, src: event.target.value }
                                    : item,
                                ),
                              }
                            : entry.featured,
                        }))
                      }
                      placeholder="/path/image.webp or /path/video.mp4"
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <input
                      value={media.poster ?? ""}
                      onChange={(event) =>
                        updateSelected((entry) => ({
                          ...entry,
                          featured: entry.featured
                            ? {
                                ...entry.featured,
                                media: entry.featured.media.map((item, idx) =>
                                  idx === mediaIndex
                                    ? { ...item, poster: event.target.value || undefined }
                                    : item,
                                ),
                              }
                            : entry.featured,
                        }))
                      }
                      placeholder="poster (optional)"
                      className="rounded border px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateSelected((entry) => ({
                          ...entry,
                          featured: entry.featured
                            ? {
                                ...entry.featured,
                                media: entry.featured.media.filter(
                                  (_, idx) => idx !== mediaIndex,
                                ),
                              }
                            : entry.featured,
                        }))
                      }
                      className="rounded border px-2 py-1 text-sm text-red-700 dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
