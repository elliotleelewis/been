import { atom } from "jotai";

import { isEarned } from "../core/achievements.ts";
import { achievementsAtom, countryCodesAtom, rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { encodeShare, shareUrlOf } from "../core/share-link.ts";
import { summaryOf } from "./summary.ts";

/** A link that opens the reader's own map, read-only, for whoever they send it to. */
export const shareUrlAtom = atom((get) =>
	shareUrlOf(encodeShare(get(visitsAtom), get(countryCodesAtom)), globalThis.location),
);

/** How many countries the reader's own map has ticked, which the share dialog says it is sending. */
export const visitedCountAtom = atom((get) => Object.keys(get(visitsAtom)).length);

/** The reader's own map summed up in emoji, to paste anywhere, ending with its link. */
export const shareSummaryAtom = atom((get) => {
	const visits = get(visitsAtom);
	return summaryOf({
		countries: Object.values(get(rawCountriesAtom)),
		tiers: get(achievementsAtom)
			.filter((achievement) => isEarned(achievement, visits))
			.map(({ tier }) => tier),
		url: get(shareUrlAtom),
		visits,
	});
});
