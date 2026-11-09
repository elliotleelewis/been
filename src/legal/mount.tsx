import { StrictMode } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { getLocale } from "../paraglide/runtime.js";

/** Puts a page of the site's small print on screen, in the page's `#app`. */
export const mount = (page: ReactNode): void => {
	const container = globalThis.document.querySelector("#app");
	if (!container) {
		throw new Error("Cannot find root element: #app");
	}
	// The page speaks the language its messages are in, as the app's does.
	globalThis.document.documentElement.lang = getLocale();
	createRoot(container).render(<StrictMode>{page}</StrictMode>);
};
