import { memo } from "react";
import type { FC } from "react";

import { LockedVisaEntry } from "./locked-visa-entry.tsx";
import type { LockedVisaGroup as LockedVisaGroupModel } from "./types.ts";

interface Props {
	readonly group: LockedVisaGroupModel;
}

/**
 * One of a locked visa's requirements still to meet, as its back lists it: what it asks for, where
 * the visa asks for more than one thing, how many more it needs, and the countries that would do.
 */
export const LockedVisaGroup: FC<Props> = memo(({ group: { label, need, open } }) => (
	<section className="mb-[2cqw]">
		<h3 className="text-[2.2cqw] font-bold tracking-[0.5cqw] text-current">
			{`${label === undefined ? "" : `${label.toUpperCase()} · `}ANY ${String(need)} OF`}
		</h3>
		<ul className="columns-2 gap-[3cqw]">
			{open.map((entry) => (
				<LockedVisaEntry key={entry.country.iso3166} entry={entry} />
			))}
		</ul>
	</section>
));
LockedVisaGroup.displayName = "LockedVisaGroup";
