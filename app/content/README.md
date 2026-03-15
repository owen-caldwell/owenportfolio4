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
- `internal-entries.ts` - MDX-backed entries
- `external-entries.ts` - outlink entries
- `entries.ts` - selector/query layer used by UI components
- `mdx-manifest.ts` - MDX metadata manifest loader (`export const title/slug/tag/date`)
- `entry-validation.ts` - validation rules for registry consistency

## Add a new internal project page

1. Create or update `app/p/<slug>/page.mdx` with:
   - `export const title`
   - `export const slug`
   - `export const tag`
   - optional `export const date`
2. Add an `InternalEntry` object in `internal-entries.ts`.
3. Set placements:
   - `menu.homeWorkOrder` for Home work list
   - `menu.mobileFeaturedOrder` for mobile featured menu
   - `featured` object for featured rail cards
4. Choose layout:
   - `layout: "article"` (default prose shell)
   - `layout: "gallery"` (lighter shell, image-focused)
   - `layout: "custom"` (reserved for special cases)

## Add an outlink entry

1. Add an `ExternalEntry` in `external-entries.ts`.
2. Add relevant placements (`homeWorkOrder`, `socialOrder`, `featured.order`).
3. Provide a unique `hoverId`.

## Validation

In development, `app/p/layout.tsx` validates:

- duplicate entry `id` / `hoverId` / internal `slug`
- malformed hrefs
- duplicate featured order
- missing featured data for featured entries
- internal registry entries missing from MDX manifest
- MDX tag mismatches vs registry tags
