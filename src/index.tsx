import { RouterProvider } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { mirrorLocation } from "./app/location.ts";
import { router } from "./app/router.tsx";
import { getLocale } from "./paraglide/runtime.js";

import "./styles.css";

const container = document.querySelector("#app");

if (!container) {
	throw new Error("Cannot find root element: #app");
}

// The page speaks the language its messages are in. Its direction stays the default left to right:
// that is every language there are messages for, and Firefox cannot yet say a locale's direction.
document.documentElement.lang = getLocale();

// The router owns the URL, and atoms read it through a mirror of its location, set before the first
// render so a share link opens on its map rather than the reader's own.
// oxlint-disable-next-line require-hook -- Wiring the router to the app's store is what this file is for, not test setup.
mirrorLocation(router.history, getDefaultStore());

const root = createRoot(container);
// oxlint-disable-next-line require-hook -- Mounting the app is the point of this file, not test setup.
root.render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
