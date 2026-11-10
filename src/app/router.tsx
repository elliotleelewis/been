import { createRouter } from "@tanstack/react-router";

import { routeTree } from "../routeTree.gen.ts";

/**
 * The site's router, over the pages in `src/routes/`, which TanStack Start makes one of wherever it
 * renders: once in the browser, and once for each page it renders ahead of time. A link is checked
 * against the pages as it is typed, so one to a page that does not exist fails the build, and a page
 * is fetched as soon as a link to it is pointed at.
 */
// oxlint-disable-next-line explicit-function-return-type, explicit-module-boundary-types -- The router's type is all generics, best left to inference, and `Register` below reads it back.
export const getRouter = () => createRouter({ defaultPreload: "intent", routeTree });

declare module "@tanstack/react-router" {
	/** Types every `Link` and `navigate` in the app by the routes above. */
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
