# Content Entry Architecture

This folder is the source of truth for homepage/menu/featured project metadata.

## Entry Types

- `InternalEntry`: an MDX-backed page inside `app/p/<slug>/page.mdx`
- `ExternalEntry`: an outlink with no local MDX page

Both entry types can participate in:

- home work list
- social links
- mobile featured menu
- featured cards
- orb color + hover mappings

## Files

- `entry-types.ts` - shared entry/type definitions
- `content-entries.json` - source of truth for combined internal + external entries
- `content-entries.ts` - typed wrapper consumed by app code
- `archive-items.ts` - archive list items and descriptors
- `entries.ts` - selector/query layer used by UI components
- `mdx-manifest.ts` - MDX metadata manifest loader (`export const title/slug/tag/date`)
- `entry-validation.ts` - validation rules for registry consistency

## Add a new internal project page

1. Create or update `app/p/<slug>/page.mdx` with:
   - `export const title`
   - `export const slug`
   - `export const tag`
   - optional `export const date`
2. Add an `InternalEntry` object in `content-entries.ts`.
3. Set placements:
   - `menu.homeWork: true` to include in Home work list
   - `menu.mobileFeatured: true` to include in mobile featured menu
   - `featured` object to include in featured rail cards
   - order is based on item position in `content-entries.json`
   - Use `featured.media` for gallery assets:
     - image: `{ src: "/path/image.webp" }`
     - video with poster: `{ src: "/path/video.mp4", poster: "/path/poster.webp" }`
4. Choose layout:
   - `layout: "article"` (default prose shell)
   - `layout: "gallery"` (lighter shell, image-focused)
   - `layout: "custom"` (reserved for special cases)

## Add an outlink entry

1. Add an `ExternalEntry` in `content-entries.json`.
2. Add relevant placements (`menu.homeWork`, `menu.social`, `menu.mobileFeatured`, `featured`).
3. Order is based on position in `content-entries.json`.
4. Provide a unique `hoverId`.

## Add an archive link item

1. Add an `ArchiveListItem` in `archive-items.ts`.
2. The item order in `archive-items.ts` is the rendered list order.
3. Add `descriptor` text shown after the project label.

## Copy-paste templates

### Internal project entry (`content-entries.json`)

```ts
{
  kind: "internal",
  id: "project-your-id",
  slug: "your-slug",
  href: "/p/your-slug",
  hoverId: "work-your-hover-id",
  title: "Full Project Title",
  menuLabel: "Short Menu Label",
  tag: "caseStudy", // "caseStudy" | "experimentation" | "archive"
  layout: "article", // "article" | "gallery" | "custom"
  mdxPath: "app/p/your-slug/page.mdx",
  menu: {
    homeWork: true,       // optional
    mobileFeatured: true, // optional
  },
  featured: {
    title: "FEATURED CARD TITLE",
    summary: "One-line summary for Featured.",
    media: [
      { src: "/your-folder/hero-image.webp" },
      { src: "/your-folder/process-shot.webp" },
      { src: "/your-folder/demo.mp4", poster: "/your-folder/demo.poster.webp" },
    ],
    imageAlt: "Accessible alt text describing the media set.",
    actionText: "View Project",
  },
},
```

### External project entry (`content-entries.json`)

```ts
{
  kind: "external",
  id: "project-external-id",
  href: "https://example.com",
  hoverId: "work-external-hover-id",
  title: "Project / Person Name",
  menuLabel: "Optional menu label",
  menu: {
    homeWork: true,      // optional
    social: true,        // optional
    mobileFeatured: true // optional
  },
  featured: {
    title: "FEATURED TITLE",
    summary: "Design & Development, Portfolio",
    media: [
      { src: "/your-folder/cover.webp" },
      { src: "/your-folder/walkthrough.mp4", poster: "/your-folder/walkthrough.poster.webp" },
    ],
    imageAlt: "Screenshot or video preview description.",
    actionText: "Visit website",
  },
},
```

### Archive item (`archive-items.ts`)

```ts
{
  id: "archive-your-id",
  href: "/p/your-slug-or-subpage",
  label: "Archive Label",
  descriptor: "short gray descriptor",
},
```

### MDX page exports (`app/p/<slug>/page.mdx`)

```mdx
export const title = "Project Title"
export const slug = "your-slug"
export const tag = "caseStudy"
export const date = "2026-03-13"
```

## Asset workflow (images/videos/posters)

1. Drop new media files into `public/...`
2. Update `featured.media` in your entry.
3. Run `pnpm optimize:assets` (or just push; pre-push runs it automatically).
4. If `public/` changed after optimization, commit those changes and push again.

Notes:

- Videos can include an explicit `poster` in `featured.media`.
- If no poster exists for a video file, the optimizer auto-generates one as:
  `<video-name>.poster.jpg` in the same folder.

## Daily checklist (quick)

1. Add/edit media in `public/...`
2. Add/update entry in `content-entries.json` (or use `/local-cms`)
3. Add/update `archive-items.ts` if needed
4. Run `pnpm build`
5. Commit and push

## Validation

In development, `app/p/layout.tsx` validates:

- duplicate entry `id` / `hoverId` / internal `slug`
- malformed hrefs
- missing featured data for featured entries
- internal registry entries missing from MDX manifest
- MDX tag mismatches vs registry tags

## Local content editor

- Run `pnpm dev` and open `/local-cms` on localhost.
- The editor writes directly to `app/content/content-entries.json`.
- It is blocked in production builds and only intended for local editing.
