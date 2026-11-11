import { HeadContent, Scripts } from "@tanstack/react-router";
import { memo } from "react";
import type { FC, ReactNode } from "react";

import { getLocale } from "../paraglide/runtime.js";

interface Props {
	readonly children: ReactNode;
}

/**
 * The document every page is drawn in, which the build renders to HTML ahead of time: the head the
 * routes fill in, and the scripts that bring the page to life. The page speaks the language its
 * messages are in, and its direction stays the default left to right, as is every language there
 * are messages for. iOS paints the strip behind the status bar with the root element's colour, so
 * the root carries the title bar's colour, and the body the app's own surface, which shows anywhere
 * inside the viewport the app leaves uncovered. The root also says the page comes in both colour
 * schemes, so what the browser draws itself, such as scrollbars, form controls and the canvas
 * before the stylesheet arrives, follows the reader's.
 */
export const Shell: FC<Props> = memo(({ children }) => (
	<html lang={getLocale()} className="scheme-light-dark bg-primary dark:bg-zinc-950">
		<head>
			<HeadContent />
			{/* The title bar's colour in each scheme, for the browser's own chrome and an installed
			app's status bar to match. They are here rather than in the root route's head, which keeps
			only one meta tag of each name. */}
			<meta name="theme-color" content="#ff6c00" media="(prefers-color-scheme: light)" />
			<meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
		</head>
		<body className="bg-white dark:bg-zinc-900">
			{children}
			<Scripts />
		</body>
	</html>
));
Shell.displayName = "Shell";
