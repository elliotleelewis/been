import { RouterProvider } from "@tanstack/react-router";
import { hydrateStart } from "@tanstack/react-start/client";
import { getDefaultStore } from "jotai";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

import { mirrorLocation } from "./app/location.ts";
import type { getRouter } from "./app/router.tsx";
import { forgetRetiredStorage } from "./core/storage.ts";

// The drawer's size, among others, was once kept in storage. Nothing reads it now, so it is cleared.
// oxlint-disable-next-line require-hook -- Tidying storage before the app starts is part of starting it, not test setup.
forgetRetiredStorage();

// The router owns the URL, and atoms read it through a mirror of its location, set before the page
// comes to life so a share link opens on its map rather than the reader's own.
const router: ReturnType<typeof getRouter> = await hydrateStart();
// oxlint-disable-next-line require-hook -- Wiring the router to the app's store is what this file is for, not test setup.
mirrorLocation(router.history, getDefaultStore());

// oxlint-disable-next-line require-hook -- Bringing the page to life is the point of this file, not test setup.
startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
});
