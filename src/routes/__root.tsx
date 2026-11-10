import { createRootRoute } from "@tanstack/react-router";

import { NotFound } from "../app/not-found.tsx";
import { Shell } from "../app/shell.tsx";

import styles from "../styles.css?url";

/**
 * Every page: the document it is drawn in, and the head they share. The routes beneath it give
 * their own titles.
 */
export const Route = createRootRoute({
	head: () => ({
		links: [
			{ href: styles, rel: "stylesheet" },
			// Installable as an app, which is also what keeps Safari from clearing the reader's map
			// after a week away: it only does that to sites, not to apps on the home screen.
			{ href: "/manifest.webmanifest", rel: "manifest" },
			{ href: "/icon.svg", rel: "icon", type: "image/svg+xml" },
			{ href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
		],
		meta: [
			// oxlint-disable-next-line unicorn/text-encoding-identifier-case -- HTML names the encoding with the hyphen.
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ content: 'Web clone of the popular mobile app "been".', name: "description" },
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: ({ children }) => <Shell>{children}</Shell>,
});
