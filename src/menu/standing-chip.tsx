import classNames from "classnames";
import { memo, useCallback } from "react";
import type { FC } from "react";

import type { Standing } from "../core/types.ts";
import { m } from "../paraglide/messages.js";

/** What each of the filter's buttons says, with how many countries it would leave. */
const LABELS: Readonly<Record<Standing, (inputs: { count: number }) => string>> = {
	both: m.menu_compare_both,
	mine: m.menu_compare_mine,
	theirs: m.menu_compare_theirs,
};

interface Props {
	readonly standing: Standing;
	readonly count: number;
	readonly pressed: boolean;
	readonly onToggle: (standing: Standing) => void;
}

/** One of the filter's buttons, with a swatch of how the globe draws its countries. */
export const StandingChip: FC<Props> = memo(({ count, onToggle, pressed, standing }) => {
	const toggle = useCallback(() => {
		onToggle(standing);
	}, [onToggle, standing]);

	return (
		<button
			type="button"
			className={classNames(
				"flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium tabular-nums focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none",
				pressed
					? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
					: "hover:bg-primary/10 dark:hover:bg-primary/20",
			)}
			aria-pressed={pressed}
			onClick={toggle}
		>
			<span
				className={classNames("size-2.5 shrink-0 rounded-full", {
					"bg-primary dark:bg-primary": standing === "both",
					"bg-theirs dark:bg-theirs": standing === "theirs",
					"ring-2 ring-primary ring-inset dark:ring-primary": standing === "mine",
				})}
				aria-hidden="true"
			/>
			{LABELS[standing]({ count })}
		</button>
	);
});
StandingChip.displayName = "StandingChip";
