import { useAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { ChangeEvent, FC } from "react";

import { comparingAtom } from "../core/comparison.ts";
import { m } from "../paraglide/messages.js";
import { StandingFilter } from "./standing-filter.tsx";

/**
 * How a shared map compares with the reader's own, as counts that narrow the list, and the switch
 * that sets the two side by side, or leaves the shared map on its own.
 */
export const SharedMapCompare: FC = memo(() => {
	const compareId = useId();
	const [comparing, setComparing] = useAtom(comparingAtom);
	const toggleComparing = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setComparing(event.target.checked);
		},
		[setComparing],
	);

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<StandingFilter />
			<label htmlFor={compareId} className="ms-auto flex shrink-0 items-center gap-2 font-medium">
				<input
					id={compareId}
					type="checkbox"
					className="size-4 rounded border-zinc-400 checked:bg-primary focus:ring-2 focus:ring-primary/50 dark:border-zinc-600 dark:bg-zinc-900"
					checked={comparing}
					onChange={toggleComparing}
				/>
				{m.menu_compare()}
			</label>
		</div>
	);
});
SharedMapCompare.displayName = "SharedMapCompare";
