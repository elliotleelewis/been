# AGENTS.md

Orientation for coding agents. Keep it short, keep it current, and describe
structure rather than features — features change, the shape does not.

## What this is

A web clone of the "been" mobile app: tick off the countries you have visited,
watch them fill in on a globe. It is a single-page application with no backend
of any kind, built with Vite and deployed as static files to Cloudflare Pages
by CI.

Goals, in priority order:

1. **No server.** The country list ships with the bundle and the selection
   lives in `localStorage`, so there is nothing to host, authenticate or
   migrate. A change that needs a backend is the wrong change.
2. **Type-safe.** `@tsconfig/strictest` and type-aware linting are on, and the
   build typechecks before it bundles. Reach for a type, not a cast.
3. **Cheap to maintain.** Dependencies arrive as Renovate pull requests and the
   whole check suite runs in CI, so upkeep stays close to zero effort.
4. **Small.** One page, one screen's worth of state. Prefer deleting code to
   generalising it.

Non-goals: accounts, syncing between devices, an API, offline-first machinery,
any country data that has to be fetched from a third party at run time.

## Architecture

One package, no workspace members — `pnpm-workspace.yaml` exists only to hold
pnpm's own settings: an ignored optional dependency, and which dependencies may
run build scripts. Everything lives under `src/`, which is also Vite's root, so
the build reads `src/index.html` and writes `dist/`.

| Directory         | Role                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| `src/components/` | React components. Presentational; they read and write atoms and hold no logic.      |
| `src/state/`      | Jotai atoms. The single source of truth, including the derived and write-only ones. |
| `src/hooks/`      | Adapters onto things React does not own: the map camera, media queries, storage.    |
| `src/data/`       | The country dataset and the world atlas it is drawn from, plus generated output.    |
| `src/models/`     | Shared types and key constants. No behaviour.                                       |
| `src/utils/`      | Pure functions, and the test helpers.                                               |
| `scripts/`        | Node-only tooling run by hand, not part of the bundle.                              |

How a selection travels:

```
data/countries.ts ──▶ rawCountriesAtom ─────────────────┐
                                                        ├─▶ countriesAtom ──▶ continentsAtom ──▶ Menu
localStorage ──▶ visitsAtom ─────┐                      │         │
                                 ├─▶ shownVisitsAtom ───┤         └───────────────────────────▶ Globe
share link ──▶ sharedVisitsAtom ─┘                      │
                                                        └─▶ selectedCountriesAtom ────────────▶ Globe
world atlas ──▶ data/boundaries.ts ──▶ boundariesAtom ──────────────────────────────▶ Globe, Passport
```

The selection is stored as an object keyed by ISO 3166-1 alpha-2 code, one visit per country, so
details can be added to a visit later; so far a visit holds the day it was ticked, if it was ticked
since dates were kept. Stored state is validated when it is read, and anything not
in today's shape is cleared rather than migrated.

The menu folds countries into their M49 regions as collapsible continents, with each sub-region a
heading inside. The reader's home continent is guessed from their time zone, listed first and, until
they open or close one themselves, the only one open; that state lives in `src/state/regions.ts`.

Searching the list lives in `src/state/search.ts`, over pure matching in `src/utils/search.ts`.
Names are compared folded, without case, accents or punctuation, a tier at a time: a code or the
start of a word, then anywhere in the name, then, only when nothing matches, near misses by edit
distance, offered as suggestions and never ticked by Enter.

The globe is MapLibre through `react-map-gl`, over a keyless CARTO basemap
whose light and dark styles follow the reader's colour scheme. Selected
countries are one fill layer filtered by ISO 3166-1 alpha-2 code, so selecting
a country changes a filter rather than any geometry. The atlas itself is a
~700kB asset fetched at run time instead of bundled, and `src/data/countries.ts`
is imported dynamically for the same reason.

The country list is a drawer the reader sizes themselves: a column beside the globe on wide
screens, a sheet under it on narrow ones. Its handle is react-aria's `useMove`, so one element
answers to pointer, touch and the arrow keys; what it stores in `menuSizeAtom` is a fraction of
the viewport per axis, which reaches the layout as the custom properties the grid tracks holding
the drawer and the globe are sized by.

Selecting a country also asks the camera to frame it, via `focusAtom`;
unselecting the country the camera is framing puts it back where it was. That
undo is deliberately one-shot and is dropped the moment the user moves the map
themselves. Left alone at world view, the globe turns slowly west to east
(`src/hooks/use-idle-spin.ts`) until anyone touches it; never under reduced motion.

Countries can also be ticked by tapping them on the globe. Every country is drawn on an invisible
layer the map tests the pointer against; a tap goes through `src/state/taps.ts`, which leaves the
camera alone, since the reader is already looking at the country, and keeps the tap so the toast
it raises can undo it. Double-click zoom is off, because its two clicks would tick and untick.

A map is shared as a link whose hash carries it: a format version, a fingerprint of the dataset's
sorted codes, then one bit per country in that order, as URL-safe base64. The order comes from the
dataset rather than a list of its own, and the fingerprint makes a link written against any other
list read as no map at all, rather than as the wrong countries. The hash never reaches a server. Opening one shows that map read-only through `shownVisitsAtom`, in place of the
reader's own, which nothing can write to until they leave it; `src/state/location.ts` watches the
hash. The share dialog draws the link as a QR code with an encoder loaded only when it opens.

The passport is a dialog of pages: a cover, an identity page summing the map up, then its stamps,
in the order they went in, six to a page (`src/state/passport.ts`). Each stamp is generated, not
drawn: its shape, slant and wording are picked from its country's code by a stable hash, its ink
from its M49 region (`src/utils/stamp.ts`), and the outline in its middle is the country's home
landmass, projected out of the same boundaries the globe draws (`src/utils/silhouette.ts`). The
passport and its pages are paper and board, the same in either colour scheme. Ticking a country
from the list, the search box or the globe plays its stamp moment (`src/state/stamping.ts`): the
stamp comes down in the middle of the screen and flies into the passport button, unless the reader
has asked for less motion. Anything that ticks a country for the reader goes through there, so
undoing, loading and shared maps never stamp. A country being stamped fills in on a fresh layer of
its own, because MapLibre can fade a paint property but not a filter; the been layer takes it back
once the moment ends, by when the two look the same.

react-aria supplies behaviour that is hard to get right by hand, such as the drawer's handle and
the toast region, which pauses its timer while focused and is reachable with F6. Elements a native
tag already makes accessible, such as checkboxes and disclosure buttons, stay native.

## Generated data

Two files under `src/data/` are generated. **Never hand-edit generated
output**; change the source and regenerate.

- `src/data/boundary-codes.ts` — Natural Earth's alpha-3 keys mapped to the ISO 3166-1 alpha-2 codes the app uses.
- `src/data/countries.ts` — the country list, with each `bounds` derived from the atlas.

The list is the 193 UN member states plus its two observer states, the Holy See and Palestine.
It holds codes, not names: each country's ISO 3166-1 alpha-2 code, its UN M49 region, and the most
specific M49 group inside it (the intermediate region where there is one, otherwise the
sub-region), which is what the menu groups by. Countries are named and sorted in the reader's
language at run time with `Intl.DisplayNames` and `Intl.Collator`; browsers do not reliably name
M49 areas, so their English names live in `src/models/m49.ts`.

Both come from `pnpm run generate:countries`. The country list is the script's
input as well as its output: a country the atlas cannot draw fails the run
rather than quietly disappearing, so adding or dropping one is an edit to
`src/data/countries.ts` followed by a regeneration. Re-run it after bumping
`visionscarto-world-atlas`.

## Conventions

- Tabs for indentation; two spaces for JSON, YAML, Markdown, per `.editorconfig`. oxfmt owns formatting, including import order — do not hand-format.
- oxlint runs type-aware with every category set to error, so the linter is strict by default and exceptions are explicit. Suppress with a `oxlint-disable-next-line <rule> -- <reason>` comment; a suppression without a reason is not one.
- Document declarations, from components and atoms down to interface members, with a JSDoc `/** */` block so editors show it on hover; `//` is for comments inside a body and for lint suppressions. Say what a thing is for in prose: TypeScript already carries the types, so `@param` and `@returns` are not required.
- React: function components as arrow functions, wrapped in `memo` with a `displayName`. Props interfaces are `readonly`, and callbacks passed down are `useCallback`ed so the memoisation is worth having.
- State lives in atoms rather than in components. Derived state is a read-only atom; anything that mutates more than one atom is a write-only atom, not a handler in a component.
- Styling is Tailwind v4, configured in `src/styles.css` rather than a config file. Use the `primary` theme colour, and give every element its `dark:` variant.
- Tests are Vitest running in a real Chromium via Playwright, co-located as `*.spec.ts(x)`, and lean on snapshots. When markup or class order changes legitimately, update the snapshot in the same commit.
- Commit messages and pull request titles follow Conventional Commits; the PR title is enforced in CI.

## Checks

Run from the repository root:

```sh
pnpm run format      # oxfmt --check              (:fix to write)
pnpm run lint        # oxlint, type-aware         (:fix to write)
pnpm run build       # tsc --noEmit, then vite build
pnpm run test        # vitest, in a browser
pnpm run e2e         # playwright, against the preview build
```

There is no separate typecheck script — `pnpm run build` is it. Both test
commands need a browser: `pnpm exec playwright install chromium` once.
`pnpm run test` watches on a TTY, so pass `--run` for a single pass. `pnpm run
e2e` builds nothing itself: it reuses a dev server on :5173 if one is already
running, and otherwise starts `pnpm run preview`, which serves whatever
`pnpm run build` last wrote to `dist/`.

Run the checks that cover what you touched before committing. CI runs lint,
format, build and test on every pull request.

## Working here

- Dependency bumps arrive as Renovate pull requests; do not hand-edit `pnpm-lock.yaml` other than by running pnpm.
- If a lockfile-maintenance or dependency update breaks a check, fix the code rather than pinning the dependency back.
- Prefer fixing the data or the map style over special-casing a country in component code. Where a country genuinely is the exception, `src/data/boundaries.ts` is where that belongs, with a comment saying why.
