import { useAtom, useAtomValue } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { comparisonAtom } from "../core/comparison.ts";
import type { Standing } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { standingFilterAtom } from "./search.ts";
import { StandingChip } from "./standing-chip.tsx";

/** The standings in the order the filter offers them, as the globe's key reads. */
const STANDINGS: readonly Standing[] = ["both", "theirs", "mine"];

/**
 * How a shared map compares with the reader's own, as a count of each standing, keyed with how the
 * globe draws each. Each count narrows the list to its countries, until it is pressed again.
 */
export const StandingFilter: FC = memo(() => {
	const comparison = useAtomValue(comparisonAtom);
	const [filter, setFilter] = useAtom(standingFilterAtom);
	const toggle = useCallback(
		(standing: Standing) => {
			setFilter((current) => (current === standing ? null : standing));
		},
		[setFilter],
	);

	return comparison === null ? null : (
		<fieldset className="-ms-2.5 flex flex-wrap gap-1">
			<legend className="sr-only">{m.menu_compare_filter()}</legend>
			{STANDINGS.map((standing) => (
				<StandingChip
					key={standing}
					standing={standing}
					count={comparison[standing].length}
					pressed={filter === standing}
					onToggle={toggle}
				/>
			))}
		</fieldset>
	);
});
StandingFilter.displayName = "StandingFilter";
