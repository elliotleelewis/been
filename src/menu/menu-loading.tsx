import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { MenuSmallPrint } from "./menu-small-print.tsx";

/**
 * What the list shows while the country list loads: a spinner, filling the space it will take, with
 * the small print at its foot, as the list has. The build renders it into the page, so the links
 * are there for anything that reads the page without running it.
 */
export const MenuLoading: FC = memo(() => (
	<div className="flex min-h-0 flex-1 flex-col">
		<div className="flex flex-1 items-center justify-center">
			<svg
				className="size-5 animate-spin text-neutral-800 dark:text-white"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<title>{m.menu_loading()}</title>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
		</div>
		<MenuSmallPrint />
	</div>
));
MenuLoading.displayName = "MenuLoading";
