import { atom } from "jotai";

import { isEarned } from "../core/achievements.ts";
import { replyComparisonAtom } from "../core/comparison.ts";
import { achievementsAtom, countryCodesAtom, rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { encodeShare } from "../core/share-link.ts";
import { summaryOf } from "./summary.ts";

/**
 * The reader's own map as a share link carries it, which the router builds the link around
 * (`src/share/use-share-url.ts`).
 */
export const shareValueAtom = atom((get) => encodeShare(get(visitsAtom), get(countryCodesAtom)));

/** How many countries the reader's own map has ticked, which the share dialog says it is sending. */
export const visitedCountAtom = atom((get) => Object.keys(get(visitsAtom)).length);

/**
 * Sums the reader's own map up in emoji, to paste anywhere, ending with the link `url`, and how it
 * compares with the last shared map they opened, which it is likely a reply to.
 */
export const shareSummaryOfAtom = atom((get) => {
	const visits = get(visitsAtom);
	const countries = Object.values(get(rawCountriesAtom));
	const tiers = get(achievementsAtom)
		.filter((achievement) => isEarned(achievement, visits))
		.map(({ tier }) => tier);
	const comparison = get(replyComparisonAtom);
	return (url: string): string => summaryOf({ comparison, countries, tiers, url, visits });
});
