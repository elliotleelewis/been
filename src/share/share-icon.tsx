import { memo } from "react";
import type { FC } from "react";

/** The icons the share dialog's buttons wear. */
export type ShareIconName = "check" | "close" | "copy" | "share";

/** Each icon's outline, on a 24-unit square. */
const PATHS: Readonly<Record<ShareIconName, string>> = {
	check: "M5 12.5 10 17.5 19 7",
	close: "M6 6l12 12M18 6 6 18",
	copy: "M9 9h10v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2zM5 15V5a2 2 0 0 1 2-2h8",
	share: "M12 3v12m0-12 4 4m-4-4-4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
};

interface Props {
	readonly name: ShareIconName;
}

/** An icon for a button in the share dialog, drawn in the button's colour. It is decoration only. */
export const ShareIcon: FC<Props> = memo(({ name }) => (
	<svg
		className="size-4"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d={PATHS[name]} />
	</svg>
));
ShareIcon.displayName = "ShareIcon";
