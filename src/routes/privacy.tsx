import { createFileRoute } from "@tanstack/react-router";

import { PrivacyPage } from "../legal/privacy-page.tsx";
import { m } from "../paraglide/messages.js";

/** The privacy policy, rendered to HTML when the site is built. */
export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
	head: () => ({ meta: [{ title: m.privacy_title() }] }),
});
