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

One package, no workspace members — `pnpm-workspace.yaml` exists only to pin
down an optional dependency. Everything lives under `src/`, which is also
Vite's root, so the build reads `src/index.html` and writes `dist/`.

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
data/countries.ts ──▶ rawCountriesAtom ─┐
                                        ├─▶ countriesAtom ──▶ regionsAtom ──▶ Menu
localStorage ──▶ selectedCountriesAtom ─┘         │
                                                  └──────────────────────────▶ Globe
world atlas ──▶ data/boundaries.ts ──▶ useCountryBoundaries ─────────────────▶ Globe
```

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
themselves.

## Generated data

Two files under `src/data/` are generated. **Never hand-edit generated
output**; change the source and regenerate.

- `src/data/boundary-codes.ts` — Natural Earth's alpha-3 keys mapped to the ISO 3166-1 alpha-2 codes the app uses.
- `src/data/countries.ts` — the country list, with each `bounds` derived from the atlas.

Both come from `pnpm run generate:countries`. The country list is the script's
input as well as its output: a country the atlas cannot draw fails the run
rather than quietly disappearing, so adding or dropping one is an edit to
`src/data/countries.ts` followed by a regeneration. Re-run it after bumping
`visionscarto-world-atlas`.

## Conventions

- Tabs for indentation; two spaces for JSON, YAML, Markdown, per `.editorconfig`. oxfmt owns formatting, including import order — do not hand-format.
- oxlint runs type-aware with every category set to error, so the linter is strict by default and exceptions are explicit. Suppress with a `oxlint-disable-next-line <rule> -- <reason>` comment; a suppression without a reason is not one.
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
