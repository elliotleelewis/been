import { createFileRoute } from "@tanstack/react-router";

import { App } from "../app/app.tsx";

/**
 * The app itself, at the root. Its component is split into a chunk of its own, so the small print
 * does not bring the globe and MapLibre with it. It only ever renders in the browser: everything on
 * it is the reader's, from local storage and the share link's hash.
 */
export const Route = createFileRoute("/")({
	component: App,
	head: () => ({ meta: [{ title: "Been" }] }),
	ssr: false,
});
