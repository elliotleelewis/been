import { atom } from "jotai";

import { countriesAtom } from "../core/countries.ts";
import { achievementsAtom } from "../core/dataset.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { M49_REGIONS } from "../core/m49.ts";
import { passportStampsAtom } from "./stamps.ts";
import { STAMPS_PER_PAGE, VISAS_PER_PAGE } from "./types.ts";
import type { PassportPage, PassportStats } from "./types.ts";
import { flippedVisaAtom } from "./visa-backs.ts";
import { visasAtom } from "./visas.ts";

/** What the identity page says about the map on show. */
export const passportStatsAtom = atom<PassportStats>((get) => {
	const stamps = get(passportStampsAtom);
	const home = get(homeRegionAtom);
	const dated = stamps.filter(({ date }) => date !== undefined);
	return {
		count: stamps.length,
		first: dated[0]?.date,
		home: home === undefined ? undefined : M49_REGIONS[home](),
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

/**
 * Whether the passport lies open two pages at a time, as a real one does, which it does on screens
 * wide enough to show both at a size that can be read.
 */
export const passportSpreadAtom = atom(false);

/**
 * The page on the left of the spread `page` is in. The cover is shut, on its own; after it, the
 * identity page is on the left, facing the first page of visas, and so on in pairs.
 */
const leftPageOf = (page: number): number => (page === 0 ? 0 : page - ((page + 1) % 2));

/** The pages the passport is open at, each in a spread with the one facing it where it lies open. */
const openPagesAtom = atom((get) => {
	const page = get(passportPageAtom);
	return get(passportSpreadAtom) && page > 0 ? [leftPageOf(page), leftPageOf(page) + 1] : [page];
});

/**
 * The pages on show, left to right: the cover alone, one page, or two facing each other, the right
 * one blank where the last page has none to face it.
 */
export const shownPassportPagesAtom = atom<readonly (PassportPage | null)[]>((get) => {
	const pages = get(passportPagesAtom);
	return get(openPagesAtom).map((page) => pages[page] ?? null);
});

/** Whether there are pages before and after those on show, to turn back and forward to. */
export const passportTurnsAtom = atom((get) => {
	const shown = get(openPagesAtom);
	return {
		back: (shown[0] ?? 0) > 0,
		forward: (shown.at(-1) ?? 0) < get(passportPageCountAtom) - 1,
	};
});

/**
 * Turns the passport's pages by `by`, forwards or back, a spread at a time where it lies open, and
 * stopping at either cover. Any visa showing its back is turned over again.
 */
export const turnPassportPageAtom = atom(undefined, (get, set, by: number) => {
	const last = get(passportPageCountAtom) - 1;
	const spread = get(passportSpreadAtom);
	const from = spread ? leftPageOf(get(passportPageAtom)) : get(passportPageAtom);
	const page = Math.min(Math.max(from + (spread ? by * 2 : by), 0), last);
	set(passportPageAtom, spread ? leftPageOf(page) : page);
	set(flippedVisaAtom, null);
});
