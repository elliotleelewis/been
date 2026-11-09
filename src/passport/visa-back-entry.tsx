import { memo } from "react";
import type { FC } from "react";

import type { VisaEntry } from "./types.ts";

interface Props {
	readonly entry: VisaEntry;
	/** Where it comes in the order the countries were ticked, the first being 1. */
	readonly place: number;
	/** Whether its tick is the one that earned the visa, which a star marks. */
	readonly clincher: boolean;
}

/** A country in the list on a visa's back: its place in the order, its name and the day. */
export const VisaBackEntry: FC<Props> = memo(({ clincher, entry, place }) => (
	<li className="flex items-baseline gap-[1.5cqw]">
		<span className="w-[4.5cqw] shrink-0 text-end tabular-nums opacity-50">{place}</span>
		<span className="min-w-0 flex-1 truncate font-semibold">
			{entry.country.name}
			{clincher ? (
				<span className="ms-[1cqw] text-current" aria-hidden="true">
					{"★"}
				</span>
			) : null}
		</span>
		<span className="shrink-0 text-[2.4cqw] tabular-nums opacity-70">{entry.date}</span>
	</li>
));
VisaBackEntry.displayName = "VisaBackEntry";
