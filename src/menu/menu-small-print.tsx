import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";

const LINK_CLASS_NAME =
	"rounded underline-offset-4 hover:text-zinc-900 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:text-white";

/**
 * The foot of the country list: links to the site's privacy policy and what it keeps on the device.
 * They keep the location's hash, so a shared map on show is still there on the way back. The list
 * shows them while it loads too, so they are in the page the build renders.
 */
export const MenuSmallPrint: FC = memo(() => (
	<nav
		className="flex justify-center gap-4 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400"
		aria-label={m.legal_footer()}
	>
		<Link to="/privacy" hash className={LINK_CLASS_NAME}>
			{m.legal_privacy_link()}
		</Link>
		<Link to="/cookies" hash className={LINK_CLASS_NAME}>
			{m.legal_cookies_link()}
		</Link>
	</nav>
));
MenuSmallPrint.displayName = "MenuSmallPrint";
