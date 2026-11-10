import { memo } from "react";
import type { FC } from "react";

/**
 * Sharing, as the title bar's button for it draws it. The page's loading screen draws it too,
 * before the button has loaded.
 */
export const ShareIcon: FC = memo(() => (
	<svg
		className="size-5"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth="2"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 3v12m0-12 4 4m-4-4-4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
		/>
	</svg>
));
ShareIcon.displayName = "ShareIcon";
