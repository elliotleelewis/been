import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";

interface Props {
	readonly complete: number;
	/**
	 * How much of the same the reader's own map has, while a shared map is set against it, drawn as
	 * a thinner ring inside the first.
	 */
	readonly mine?: number | undefined;
}

export const Progress: FC<Props> = memo(({ complete, mine }) => (
	<div className="relative size-5">
		<svg className="-rotate-90 size-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
			<title>
				{mine === undefined
					? m.menu_progress({ complete })
					: m.menu_progress_compared({ complete, mine })}
			</title>
			<circle
				cx="18"
				cy="18"
				r="16"
				fill="none"
				className="stroke-current text-gray-500 dark:text-neutral-500"
				strokeWidth="4"
			/>
			<circle
				cx="18"
				cy="18"
				r="16"
				fill="none"
				className="stroke-current text-primary dark:text-primary"
				strokeWidth="4"
				strokeDasharray="100"
				strokeDashoffset={(1 - complete) * 100}
				strokeLinecap="round"
			/>
			{mine === undefined ? null : (
				<circle
					cx="18"
					cy="18"
					r="9"
					fill="none"
					className="stroke-current text-zinc-700 dark:text-zinc-200"
					strokeWidth="3"
					pathLength="100"
					strokeDasharray="100"
					strokeDashoffset={(1 - mine) * 100}
					strokeLinecap="round"
				/>
			)}
		</svg>
	</div>
));
Progress.displayName = "Progress";
