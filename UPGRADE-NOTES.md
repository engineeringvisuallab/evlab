# EVLab Upgrade Notes

This build is `evlab.zip` (your current, more advanced app) upgraded with
the features from `evlab-_-engineering-visual-lab.zip` (an earlier branch
of the same project) that it was missing. **No original file was deleted.**
Everything below was either added new or edited in place.

## What was added

### 1. Admin Panel (`/admin`)
A full back-office for managing the UELE database, brought over from the
other zip and adapted to fit this project's structure:

- `src/pages/AdminPage.tsx` — login gate + shell
- `src/components/admin/**` — dashboard, sidebar, header, login form,
  system tools (users, audit log, settings), UELE data managers
  (facilities, components, parameters, networks, 3D models, GIS layers,
  hierarchy, engineering info, learning links, publish/validation)
- `src/services/adminAuthService.ts`, `src/services/ueleAdminService.ts`
- `src/types/admin.ts`
- `data/admin-database.json`, `data/uele-database.json` — server-side
  storage the API reads/writes
- Wired in: lazy-loaded `/admin` route in `src/App.tsx`, quiet "Admin"
  link in the footer

### 2. Admin API server (`server.ts`)
The admin panel needs a backend (auth, sessions, CRUD for the UELE
database, GIS layer storage, 3D model uploads). This is an Express
server, kept separate from your existing Vite-only public site:

- `npm run dev:admin` — runs the API + serves the app together on
  `:3000` for local development
- `npm run build:admin-server` / `npm run start:admin` — bundle + run
  it in production
- Your existing `npm run dev` / `npm run build` / `npm run preview` are
  untouched. If you use plain `npm run dev`, a `/api` proxy to `:3000`
  was added to `vite.config.ts` so the admin panel still works as long
  as `npm run dev:admin` is also running.
- `.env.example` — `INITIAL_ADMIN_PASSWORD` for the seeded Super Admin
  account (`EVL-ADMIN-001`)

### 3. GIS import + 2D/3D UELE viewer — now live on the `/uele` page
On the `/uele` page there's now a mode toggle in the top-right:
**"Facility Catalog"** (your existing, unchanged experience — same default
view, same water treatment pipeline, same object inspector) vs.
**"Live GIS Import"** (new) — imports Shapefile/GeoJSON, satellite
basemaps, synchronized 2D/3D vector views, category-focus filtering, and a
layers drawer. It's `src/components/uele/GISImportWorkspace.tsx`, wiring
together:

- `src/utils/gisImporter.ts`, `gisStorage.ts`, `coordProjectionService.ts`
- `src/data/sherpur-gis-data.ts`, `uele-basemaps.ts`, `uele-categories.ts`
- `src/components/uele/UELE2DMap.tsx`, `UELE3DView.tsx`, `UELEViewport.tsx`,
  `UELEInspectorShell.tsx`, `UELELayersDrawer.tsx`, `UELEImportModal.tsx`,
  `UELEMapSearch.tsx`
- New dependency: `shpjs` (shapefile import)

Imported layers persist via `gisStorage`: it tries the admin server's
`/api/gis/layers` first, then falls back to IndexedDB, then
`localStorage` — so this mode works standalone even without
`npm run dev:admin` running.

It's lazy-loaded (`React.lazy`) so the 3D-view dependencies
(`three`/`@react-three`) and `shpjs` only download when a visitor actually
switches into GIS Import mode — the default Facility Catalog experience
and every other page's bundle size are unaffected.

### 4. Type-collision handling
The other zip's UELE types file collided with 3 names already used by
your existing UELE viewer (`UELERegion`, `UELEComponent`, `UELEParameter`
mean different things in each). To avoid breaking your existing code,
its types were ported to a new file, `src/types/adminUele.ts`, with only
those 3 renamed (`AdminUELERegion`, `AdminUELEComponent`,
`AdminUELEParameter`). Everything else keeps its original name.

### 5. Design system additions
Your `Button` and `Badge` components only had a fixed set of color
variants. The admin panel needed a few more (`amber`, `cyan`, `emerald`,
`rose`/`slate`), so those were added as new variants — nothing existing
was changed or removed. A `--accent-rose` color token was added to
`src/index.css` (light + dark) to back the new `rose` variant.

### 6. Reference scripts (not run automatically)
- `scripts/EVLab_Admin_AppsScript.gs` — Google Apps Script from the other
  zip, kept for reference
- `scripts/reference-update-cr0318.js` — a large one-off registry-data
  migration script from the other zip. **Not executed** — its target
  JSON schema (`domain` field) doesn't match your current registries
  (`discipline` + `level` + `tags`), so it needs review before running.

## What was intentionally left out
AI-Studio-specific scaffolding from the other zip that doesn't apply to
this project's Vite + tsc build: `bun.lock`, `assets/.aistudio/`,
`app/applet/build-global-stage2.cjs`, `scripts/build-global-stage2.cjs`,
`scripts/validate-stage2-global.cjs`, its `README.md`, and its
`STAGE-01-REPORT.md` / `STAGE-02-REPORT.md` (those document the other
zip's own build history, not this one's).

## Verified
- `npx tsc -b` — clean, no errors
- `npx vite build` — succeeds; `AdminPage` and `GISImportWorkspace`
  (+ its `gisImporter`/`shpjs` chunk) each code-split into their own lazy
  chunks, so main bundle size is unaffected
- `server.ts` — type-checks clean standalone
- `/uele` page — both modes (Facility Catalog default, Live GIS Import
  toggle) render without breaking the existing experience

## Also included in this build
### 7. WTP module upgraded
`src/software/wtp/` was merged with a newer standalone build of the WTP
suite: ~20 additional engine modules (compliance, commissioning, QA/QC,
design alternatives, master reporting, etc.) and 3 new tabs (Formula
Explorer, Design Alternatives, Phase 12 Engineering Suite), wired into
`WtpApp.tsx` and the sidebar. Embedding-specific customizations already in
place (the "Publish to BIM" header button, optional-prop safety on a few
view components) were preserved rather than overwritten.

### 8. STP module added
A new `src/software/stp/` module (Sewerage & Wastewater Treatment Plant
design suite) was added following the same pattern as the other
standalone tools: `StpApp.tsx` entry, lazy route at `/software/stp`, and
an `evlab-stp` entry in `evlab-tools.json` (Waves icon, emerald accent) so
it appears on the Software page. Several pre-existing type errors in the
original STP suite (mismatched property/method names between its engine
and UI panels) were fixed rather than carried over.

Verified: `npx tsc -b` — 0 errors across the whole project (WTP + STP
included); `npx vite build` — succeeds, `WtpApp` and `StpApp` each
code-split into their own chunk.
