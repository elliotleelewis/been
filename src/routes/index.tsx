import { createFileRoute } from "@tanstack/react-router";

import { AppLoading } from "../app/app-loading.tsx";
import { App } from "../app/app.tsx";
import { BEFORE_PAINT_SCRIPT } from "../app/before-paint.ts";

/**
 * The app itself, at the root. Its component is split into a chunk of its own, so the small print
 * does not bring the globe and MapLibre with it. It only ever renders in the browser: everything on
 * it is the reader's, from local storage and the share link's hash. The build renders its loading
 * screen in its place, which a script in the head readies for the reader before it is painted.
 * The globe can draw nothing until it has the basemap's style and tiles from CARTO, so the page
 * opens connections to both hosts while its scripts load. MapLibre fetches them with CORS, which
 * a preconnect has to say as well, or the browser opens a second connection for the real requests.
 */
export const Route = createFileRoute("/")({
	component: App,
	head: () => ({
		links: [
			{ crossOrigin: "anonymous", href: "https://basemaps.cartocdn.com", rel: "preconnect" },
			{ crossOrigin: "anonymous", href: "https://tiles.basemaps.cartocdn.com", rel: "preconnect" },
		],
		meta: [{ title: "Been" }],
		scripts: [{ children: BEFORE_PAINT_SCRIPT }],
	}),
	pendingComponent: AppLoading,
	ssr: false,
});
