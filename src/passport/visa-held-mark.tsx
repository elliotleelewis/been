import { memo } from "react";
import type { FC } from "react";

/**
 * A mark pressed on the corner of a visa on a shared map that the reader's own map holds too, as a
 * second stamp on the same page. It is a picture only: the visa says so in words beside it.
 */
export const VisaHeldMark: FC = memo(() => (
	<span
		className="pointer-events-none absolute end-[3cqw] bottom-[3cqw] rotate-[-8deg] rounded-[1cqw] border-[0.6cqw] border-primary bg-[#fbf7ec]/80 px-[1.5cqw] py-[0.5cqw] text-[3cqw] font-extrabold tracking-[0.4cqw] text-primary dark:border-primary dark:text-primary"
		aria-hidden="true"
	>
		{"YOURS TOO"}
	</span>
));
VisaHeldMark.displayName = "VisaHeldMark";
