import { createRootRoute } from "@tanstack/react-router";

import { NotFound } from "../app/not-found.tsx";
import { Shell } from "../app/shell.tsx";
import { m } from "../paraglide/messages.js";

import styles from "../styles.css?url";

/**
 * The picture a link to any page is previewed with, from `social.svg` by `pnpm run generate:icons`.
 * Previews need its whole address, so it is always production's: a preview deployment's links show
 * the live site's picture, which is the same one.
 */
const SOCIAL_IMAGE_URL = "https://been.elliotleelewis.com/social.png";

/** The size `social.png` is drawn at, which lets a preview lay it out before it has loaded. */
const SOCIAL_IMAGE_SIZE = { height: 630, width: 1200 } as const;

/**
 * Every page: the document it is drawn in, and the head they share. The routes beneath it give
 * their own titles, which a preview falls back to where a route has no `og:title` of its own. A link pasted into a chat or a post is previewed from the Open Graph tags,
 * with a large picture: the map in a share link is in its hash, which a preview's crawler is never
 * sent, so the preview is the same for every link, and asks the question the map answers.
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
			{ content: m.meta_description(), name: "description" },
			{ content: "Been", property: "og:site_name" },
			{ content: "website", property: "og:type" },
			{ content: m.meta_description(), property: "og:description" },
			{ content: SOCIAL_IMAGE_URL, property: "og:image" },
			{ content: "image/png", property: "og:image:type" },
			{ content: String(SOCIAL_IMAGE_SIZE.width), property: "og:image:width" },
			{ content: String(SOCIAL_IMAGE_SIZE.height), property: "og:image:height" },
			{ content: m.meta_image_alt(), property: "og:image:alt" },
			{ content: "summary_large_image", name: "twitter:card" },
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: ({ children }) => <Shell>{children}</Shell>,
});
