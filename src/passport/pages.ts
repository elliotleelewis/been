import { atom } from "jotai";

import { countriesAtom } from "../core/countries.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { M49_REGIONS } from "../core/m49.ts";
import { passportStampsAtom } from "./stamps.ts";
import { STAMPS_PER_PAGE, VISAS_PER_PAGE } from "./types.ts";
import type { PassportPage, PassportStats } from "./types.ts";
import { achievementsAtom, visasAtom } from "./visas.ts";

/** What the identity page says about the map on show. */
export const passportStatsAtom = atom<PassportStats>((get) => {
	const stamps = get(passportStampsAtom);
	const home = get(homeRegionAtom);
	const dated = stamps.filter(({ date }) => date !== undefined);
	return {
		count: stamps.length,
		first: dated[0]?.date,
		home: home === undefined ? undefined : M49_REGIONS[home],
		latest: dated.at(-1)?.date,
		regions: new Set(stamps.map(({ country }) => country.region)).size,
		total: get(countriesAtom).length,
		visaTotal: get(achievementsAtom).length,
		visas: get(visasAtom).length,
	};
});

/**
 * The passport's pages in order: the cover, the identity page, a page for every two visas, if the
 * map has earned any, then a page for every six stamps, with at least one to say where stamps come
 * from.
 */
export const passportPagesAtom = atom<readonly PassportPage[]>((get) => {
	const visaPages = Math.ceil(get(visasAtom).length / VISAS_PER_PAGE);
	const stampPages = Math.max(1, Math.ceil(get(passportStampsAtom).length / STAMPS_PER_PAGE));
	return [
		{ kind: "cover" },
		{ kind: "identity" },
		...Array.from({ length: visaPages }, (_page, index): PassportPage => ({
			index,
			kind: "visas",
			of: visaPages,
		})),
		...Array.from({ length: stampPages }, (_page, index): PassportPage => ({
			index,
			kind: "stamps",
			of: stampPages,
		})),
	];
});

/** How many pages the passport has. */
export const passportPageCountAtom = atom((get) => get(passportPagesAtom).length);

/** The page the passport is open at, the cover being the first. */
export const passportPageAtom = atom(0);

/** Turns the passport's pages by `by`, forwards or back, stopping at either cover. */
export const turnPassportPageAtom = atom(undefined, (get, set, by: number) => {
	const last = get(passportPageCountAtom) - 1;
	const page = get(passportPageAtom) + by;
	set(passportPageAtom, Math.min(Math.max(page, 0), last));
});
