import {
	createRootRoute,
	createRoute,
	createRouter,
	lazyRouteComponent,
} from "@tanstack/react-router";

import { m } from "../paraglide/messages.js";
import { NotFound } from "./not-found.tsx";
import { Page } from "./page.tsx";

/** Every page: the one on show, as each brings its own title bar, titled as it says. */
const rootRoute = createRootRoute({ component: Page, notFoundComponent: NotFound });

/**
 * The app itself, at the root. It is loaded only when it is asked for, so the small print does not
 * bring the globe and MapLibre with it.
 */
const mapRoute = createRoute({
	component: lazyRouteComponent(async () => {
		const page = await import("./app.tsx");
		return page;
	}, "App"),
	getParentRoute: () => rootRoute,
	head: () => ({ meta: [{ title: "Been" }] }),
	path: "/",
});

/** The privacy policy. */
const privacyRoute = createRoute({
	component: lazyRouteComponent(async () => {
		const page = await import("../legal/privacy-page.tsx");
		return page;
	}, "PrivacyPage"),
	getParentRoute: () => rootRoute,
	head: () => ({ meta: [{ title: m.privacy_title() }] }),
	path: "/privacy",
});

/** What the site keeps on the reader's device. */
const cookiesRoute = createRoute({
	component: lazyRouteComponent(async () => {
		const page = await import("../legal/cookies-page.tsx");
		return page;
	}, "CookiesPage"),
	getParentRoute: () => rootRoute,
	head: () => ({ meta: [{ title: m.cookies_title() }] }),
	path: "/cookies",
});

/**
 * The site's pages, by path. A link is checked against these as it is typed, so one to a page
 * that does not exist fails the build. A page is fetched as soon as a link to it is pointed at.
 */
export const router = createRouter({
	defaultPreload: "intent",
	routeTree: rootRoute.addChildren([mapRoute, privacyRoute, cookiesRoute]),
});

declare module "@tanstack/react-router" {
	/** Types every `Link` and `navigate` in the app by the routes above. */
	interface Register {
		router: typeof router;
	}
}
