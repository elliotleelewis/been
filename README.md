# been

A web clone of the "been" mobile app: tick off the countries you have visited,
watch them fill in on a globe. A React single-page application with no backend
— the country list ships in the bundle, the selection lives in `localStorage`,
and CI deploys the built files to Cloudflare Pages.

[AGENTS.md](./AGENTS.md) covers the architecture, the generated data and the
conventions. This file covers the part that is easy to forget between visits:
how to get it running.

## Prerequisites

- **Node 24**, which is what CI builds on.
- **pnpm**, enabled with `corepack enable`. The version is pinned by
  `packageManager` in `package.json`.
- **Chromium**, for the tests. Both test suites drive a real browser.

There is nothing else to configure: no environment variables, no database, no
API to point at.

## First-time setup

```sh
pnpm install
pnpm exec playwright install chromium
```

## Running locally

```sh
pnpm start          # Vite on :5173, hot reload
pnpm run build      # typecheck, then bundle to dist/
pnpm run preview    # serves whatever dist/ holds, on :4173
```

One trap worth knowing: `pnpm run e2e` looks for a server on :5173, so leave
`pnpm start` running in another terminal. Without one it falls back to starting
`pnpm run preview`, which serves :4173, and then times out waiting for a port
nothing is listening on. CI does not hit this — there it builds first and runs
against the preview server directly.

## Country data

`src/data/countries.ts` and `src/data/boundary-codes.ts` are generated, so edit
the country list and regenerate rather than editing the bounds by hand:

```sh
pnpm run generate:countries
```

Re-run it after bumping `visionscarto-world-atlas`. A country the atlas cannot
draw fails the run rather than quietly disappearing.

## Deploying

There is no manual step. Pushing to `main` runs the checks and uploads `dist/`
to the `been` Cloudflare Pages project. Pull requests deploy too, as Cloudflare
preview builds, and that job runs whether or not the checks pass — so a green
preview link is not a green build.

## Checks

```sh
pnpm run format      # oxfmt --check              (:fix to write)
pnpm run lint        # oxlint, type-aware         (:fix to write)
pnpm run build       # tsc --noEmit, then vite build
pnpm run test        # vitest, in a browser
pnpm run e2e         # playwright, needs a server
```

`pnpm run build` is the typecheck; there is no separate script for it.
`pnpm run test` watches on a TTY, so pass `--run` for a single pass. CI runs
lint, format, build and test on every pull request.
