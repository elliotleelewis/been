import { createFileRoute } from "@tanstack/react-router";

import { CookiesPage } from "../legal/cookies-page.tsx";
import { m } from "../paraglide/messages.js";

/** What the site keeps on the reader's device, rendered to HTML when the site is built. */
export const Route = createFileRoute("/cookies")({
	component: CookiesPage,
	head: () => ({ meta: [{ title: m.cookies_title() }] }),
});
