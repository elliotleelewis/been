import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";

const LINK_CLASS_NAME =
	"rounded underline-offset-4 hover:text-zinc-900 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:text-white";

/** The foot of the country list: links to the site's privacy policy and what it keeps on the device. */
export const MenuSmallPrint: FC = memo(() => (
	<li>
		<nav
			className="flex justify-center gap-4 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400"
			aria-label={m.legal_footer()}
		>
			<Link to="/privacy" className={LINK_CLASS_NAME}>
				{m.legal_privacy_link()}
			</Link>
			<Link to="/cookies" className={LINK_CLASS_NAME}>
				{m.legal_cookies_link()}
			</Link>
		</nav>
	</li>
));
MenuSmallPrint.displayName = "MenuSmallPrint";
