import { memo } from "react";
import type { FC } from "react";

import { COOKIES_PATH, PRIVACY_PATH } from "../core/types.ts";
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
			<a href={PRIVACY_PATH} className={LINK_CLASS_NAME}>
				{m.legal_privacy_link()}
			</a>
			<a href={COOKIES_PATH} className={LINK_CLASS_NAME}>
				{m.legal_cookies_link()}
			</a>
		</nav>
	</li>
));
MenuSmallPrint.displayName = "MenuSmallPrint";
