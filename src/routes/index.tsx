import { createFileRoute } from "@tanstack/react-router";

import { AppLoading } from "../app/app-loading.tsx";
import { App } from "../app/app.tsx";
import { BEFORE_PAINT_SCRIPT } from "../app/before-paint.ts";

/**
 * The app itself, at the root. Its component is split into a chunk of its own, so the small print
 * does not bring the globe and MapLibre with it. It only ever renders in the browser: everything on
 * it is the reader's, from local storage and the share link's hash. The build renders its loading
 * screen in its place, which a script in the head readies for the reader before it is painted.
 */
export const Route = createFileRoute("/")({
	component: App,
	head: () => ({ meta: [{ title: "Been" }], scripts: [{ children: BEFORE_PAINT_SCRIPT }] }),
	pendingComponent: AppLoading,
	ssr: false,
});
