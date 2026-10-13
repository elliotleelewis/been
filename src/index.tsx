import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/app.tsx";
import { getLocale } from "./paraglide/runtime.js";

import "./styles.css";

const container = document.querySelector("#app");

if (!container) {
	throw new Error("Cannot find root element: #app");
}

// The page speaks the language its messages are in. Its direction stays the default left to right:
// that is every language there are messages for, and Firefox cannot yet say a locale's direction.
document.documentElement.lang = getLocale();

const root = createRoot(container);
// oxlint-disable-next-line require-hook -- Mounting the app is the point of this file, not test setup.
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
