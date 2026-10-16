# AGENTS.md

Orientation for coding agents. Keep it short, keep it current, and describe
structure rather than features — features change, the shape does not.
`pnpm run lint` checks this file with [agnix](https://github.com/agent-sh/agnix),
which caps it at 12,000 characters; `pnpm exec agnix explain <rule>` says why a
rule fired.

## Overview

A web clone of the "been" mobile app: tick off the countries you have visited,
watch them fill in on a globe. A single-page application with no backend, built
with Vite and deployed as static files to Cloudflare Pages by CI. The
[README](./README.md) covers setup and running it.

Goals, in priority order:

1. **No server.** The country list ships with the bundle and the selection
   lives in `localStorage`. A change that needs a backend is the wrong change.
2. **Type-safe.** `@tsconfig/strictest` and type-aware linting are on, and the
   build typechecks before it bundles. Reach for a type, not a cast.
3. **Cheap to maintain.** Renovate brings the dependencies, CI runs every check.
4. **Small.** One page, one screen's worth of state. Prefer deleting code to
   generalising it.

Non-goals: accounts, syncing between devices, an API, offline-first machinery,
any country data fetched from a third party at run time.

## Architecture

One package; `pnpm-workspace.yaml` only holds pnpm's settings. `src/` is Vite's
root: the build reads `src/index.html` and writes `dist/`.

| Directory       | Role                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| `src/app/`      | The shell that puts the features on screen: the layout, the header.               |
| `src/core/`     | What every feature reads: the dataset, the visits, ticking, the share link, M49.  |
| `src/globe/`    | The MapLibre globe: its layers and camera, and ticking by tapping it.             |
| `src/menu/`     | The country list: continents, search, progress rings and the drawer's handle.     |
| `src/passport/` | The passport: its pages, generated stamps and visas, achievements, their moments. |
| `src/share/`    | The share button and dialog, with the link's QR code.                             |
| `src/data/`     | The country dataset and the world atlas it is drawn from, plus generated output.  |
| `src/public/`   | Copied into the build as is: the web app manifest and the app's icons.            |
| `scripts/`      | Node-only tooling run by hand, not part of the bundle.                            |

Each folder is flat, and a file's kind is in its name: `*.tsx` is a component, `use-*.ts` a hook
onto something React does not own, `types.ts` the folder's shared types and constants, and every
other `*.ts` either atoms or pure functions, not both. A feature imports only `core/` and `data/`,
and `core/` imports no feature; the linter enforces both, so anything two features need moves into
`core/`. `app/` is the one place that imports features.

How a selection travels:

```
data/countries.ts ──▶ rawCountriesAtom ─────────────────┐
                                                        ├─▶ countriesAtom ──▶ continentsAtom ──▶ Menu
localStorage ──▶ visitsAtom ─────┐                      │         │
                                 ├─▶ shownVisitsAtom ───┤         └───────────────────────────▶ Globe
share link ──▶ sharedVisitsAtom ─┘                      │
                                                        └─▶ selectedCountriesAtom ────────────▶ Globe
world atlas ──▶ data/boundaries.ts ──▶ boundariesAtom ──────────────────────────────▶ Globe, Passport
rawCountriesAtom ──▶ achievementsAtom ─┬─▶ visasAtom (with shownVisitsAtom) ─────────────▶ Passport
                                       └─▶ landStampAtom (each stamp that lands) ───────▶ visa moment
```

Rules that keep that shape:

- **Visits** are an object keyed by ISO 3166-1 alpha-2 code, so a visit can gain details; so far,
  the day it was ticked. Stored state is validated when read, and anything not in today's shape is
  cleared rather than migrated. Writing visits asks once a session for persistent storage
  (`src/core/persistence.ts`); the web app manifest matters as much, as Safari clears an unused
  site's storage after a week but not a home-screen app's. No service worker: offline isn't a goal.
- **Ticking** for the reader goes through `src/core/ticking.ts`, which starts the stamp moment;
  undoing, loading and shared maps go around it, so they don't stamp. The passport plays the moment, and when the stamp
  lands (`src/passport/moments.ts`) decides whether a visa moment follows. Both respect reduced motion.
- **The globe** is MapLibre through `react-map-gl`, on a keyless CARTO basemap that follows the
  colour scheme. Selected countries are one fill layer filtered by code: selecting changes a filter,
  not geometry. A country being stamped fills in on a layer of its own, because MapLibre can fade a
  paint property but not a filter. The ~700kB atlas is fetched at run time and
  `src/data/countries.ts` imported dynamically, to keep both out of the bundle.
- **The camera** frames a selected country via `focusAtom`; unselecting the framed one puts it back,
  once, until the reader moves the map. At world view it idles in a slow spin
  (`src/globe/use-idle-spin.ts`), but not under reduced motion. Tapping a country ticks it through
  `src/globe/taps.ts`, leaving the camera alone; double-click zoom is off, or it would tick twice.
- **The menu** groups countries by M49 region and sub-region, opening the reader's home continent,
  guessed from their time zone (`src/menu/regions.ts`). Search (`src/menu/search.ts`, over pure
  `src/menu/matching.ts`) folds case, accents and punctuation, and goes a tier at a time: code or
  word start, then anywhere, then near misses as suggestions only, which Enter doesn't tick. The
  drawer's handle is react-aria's `useMove`; `menuSizeAtom` stores a fraction of the viewport per axis.
- **A share link** carries the map in its hash, which browsers don't send to a server: a format version, a
  fingerprint of the dataset's sorted codes, then one bit per country in that order, as URL-safe
  base64. The order comes from the dataset, and a link from any other list reads as no map. It
  opens read-only through `shownVisitsAtom` (`src/core/location.ts` watches the hash). The QR
  encoder loads only when the share dialog opens.
- **The passport** is pages (`src/passport/pages.ts`): a cover, an identity page, the visas, then
  stamps six to a page. **Stamps** are generated, not drawn: shape, slant and wording from a stable hash of the code, ink
  from the M49 region (`src/passport/stamp-design.ts`), and the outline is the country's home
  landmass from the globe's boundaries (`src/passport/silhouette.ts`). The passport is paper and
  board, the same in either colour scheme.
- **Achievements** are visas, with generated line-work (`src/passport/guilloche.ts`), built from the dataset in
  `src/passport/achievements.ts` (milestones,
  continents, sub-regions, hemispheres, and collections in `src/data/collections.ts`). Earning one is
  derived from the visits and not stored; its date is the day of the tick that met its last
  requirement.
- **Accessibility:** react-aria supplies what is hard to get right by hand (the drawer's handle, the
  toast region). Anything a native tag already makes accessible stays native.

## Text

Messages are in `messages/en.json`, through [Paraglide](https://paraglidejs.com): typed functions
like `m.menu_retry()` from `../paraglide/messages.js`, compiled into the uncommitted
`src/paraglide/` by `prepare` and the Vite plugin. `allowJs` is on so a missing message or input
fails the build.

- Keys are `snake_case`, named by where they're shown: `menu_…`, `globe_…`, `share_…`,
  `passport_…`, `achievement_…`, and `m49_…` for M49 areas (`src/core/m49.ts`).
- Counts use plural variants (`share_summary`), shares `: number` (`menu_progress`), not code.
- All text is in messages except the app's name and the passport's own lettering ("PASSPORT",
  "VISA", stamp captions, visa fields, the machine-readable lines). Countries are named by
  `Intl.DisplayNames`.
- English is the only language. Adding one is a `messages/{locale}.json` and the locale in
  `project.inlang/settings.json`. The page's `lang` follows the locale (`src/index.tsx`); its `dir` stays the default until there is a right-to-left one.

## Generated data

**Don't hand-edit generated output**: change the source and regenerate.

- `src/data/countries.ts` and `src/data/boundary-codes.ts` come from `pnpm run generate:countries`.
  The country list is the script's input as well as its output, so add or drop a country by editing
  it and regenerating. Re-run it after bumping `visionscarto-world-atlas`.
- `src/public/*.png` come from `src/public/icon.svg`, by `pnpm run generate:icons`.

The list is the 193 UN members plus the Holy See and Palestine, as codes: alpha-2, M49 region, and
the most specific M49 group inside it, which the menu groups by. Names come from `Intl.DisplayNames`
at run time, except M49 areas', which are messages.

## Conventions

- Tabs, but two spaces for JSON, YAML and Markdown (`.editorconfig`). oxfmt owns formatting and import order.
- Relative imports include the extension (`./types.ts`), so Node can run `scripts/` against the same files.
- oxlint runs type-aware with every category an error. Suppress with `oxlint-disable-next-line <rule> -- <reason>`; a reason is required.
- Every declaration, down to interface members, gets a JSDoc `/** */` saying what it's for. No `@param` or `@returns`: the types carry them. `//` is for comments in a body and suppressions.
- React: arrow function components in `memo` with a `displayName`, `readonly` props, and callbacks passed down wrapped in `useCallback`.
- Components are presentational: state is atoms, derived state a read-only atom, and anything that changes more than one atom a write-only atom.
- Tailwind v4, configured in `src/styles.css`. Use the `primary` theme colour, and give every element its `dark:` variant.
- Tests are Vitest in a real Chromium, co-located as `*.spec.ts(x)`, with snapshots. Update a snapshot in the same commit as the markup change.
- Commit messages and PR titles follow Conventional Commits; CI checks the title.

## Checks

`pnpm run format`, `lint`, `build` (the typecheck) and `test` (pass `--run` for one pass), plus
`e2e`; see the README for the e2e server. Run the ones covering what you touched before committing. CI runs all but `e2e` on every pull request.

## Working here

- Change dependencies with pnpm; the lockfile isn't edited by hand. Renovate brings updates.
- If a dependency update breaks a check, fix the code rather than pinning the dependency back.
- Prefer fixing the data or the map style over special-casing a country in a component. Where one really is the exception, it goes in `src/data/boundaries.ts`, with a comment saying why.
