import classNames from "classnames";
import { memo } from "react";
import type { FC } from "react";

import type { Standing } from "../core/types.ts";
import { m } from "../paraglide/messages.js";

/** What each standing is called beside a country, as the reader would put it. */
const LABELS: Readonly<Record<Standing, () => string>> = {
	both: m.menu_standing_both,
	mine: m.menu_standing_mine,
	theirs: m.menu_standing_theirs,
};

interface Props {
	readonly standing: Standing;
}

/**
 * Says where a country stands between a shared map and the reader's own, coloured as the globe
 * draws it: filled for one on both, in the shared map's colour for one new to the reader, and
 * outlined for one on the reader's map alone.
 */
export const StandingBadge: FC<Props> = memo(({ standing }) => (
	<span className="ms-auto shrink-0 ps-2">
		<span
			className={classNames("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", {
				"bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary": standing === "both",
				"bg-theirs/15 text-sky-700 dark:bg-theirs/25 dark:text-sky-300": standing === "theirs",
				"text-primary ring-1 ring-primary ring-inset dark:text-primary dark:ring-primary":
					standing === "mine",
			})}
		>
			{LABELS[standing]()}
		</span>
	</span>
));
StandingBadge.displayName = "StandingBadge";
