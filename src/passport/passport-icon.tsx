import { memo } from "react";
import type { FC } from "react";

/**
 * The passport, as the title bar's button for it draws it. The page's loading screen draws it too,
 * before the button has loaded.
 */
export const PassportIcon: FC = memo(() => (
	<svg
		className="size-5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect x="5" y="3" width="14" height="18" rx="2" />
		<circle cx="12" cy="10" r="3" />
		<path d="M9 16h6" />
	</svg>
));
PassportIcon.displayName = "PassportIcon";
