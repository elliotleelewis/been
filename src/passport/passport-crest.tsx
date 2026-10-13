import { memo } from "react";
import type { FC } from "react";

interface Props {
	/** Large and gold on the cover, or small and boxed, like a photo, on the identity page. */
	readonly variant: "cover" | "page";
}

const CLASS_NAMES: Readonly<Record<Props["variant"], string>> = {
	cover: "size-24",
	page: "size-20 shrink-0 rounded-sm border border-[#3b3a35]/40 p-2 text-[#1d2b4f] dark:border-[#3b3a35]/40 dark:text-[#1d2b4f]",
};

/** The passport's crest: a globe of meridians and parallels, drawn in whatever colour it sits in. */
export const PassportCrest: FC<Props> = memo(({ variant }) => (
	<svg
		className={CLASS_NAMES[variant]}
		viewBox="0 0 64 64"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		aria-hidden="true"
	>
		<circle cx="32" cy="32" r="26" />
		<ellipse cx="32" cy="32" rx="11" ry="26" />
		<ellipse cx="32" cy="32" rx="20" ry="26" />
		<path d="M6 32h52M10 19h44M10 45h44M32 6v52" />
		<circle cx="32" cy="32" r="30" strokeDasharray="1.5 3" />
	</svg>
));
PassportCrest.displayName = "PassportCrest";
