import { atom } from "jotai";

import { countriesAtom } from "../core/countries.ts";
import { achievementsAtom } from "../core/dataset.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { M49_REGIONS } from "../core/m49.ts";
import { lockedVisasAtom } from "./locked-visas.ts";
import { passportStampsAtom } from "./stamps.ts";
import { STAMPS_PER_PAGE, VISAS_PER_PAGE } from "./types.ts";
import type {
	PassportChapter,
	PassportChapterStart,
	PassportOpening,
	PassportPage,
	PassportStats,
	PassportTurn,
} from "./types.ts";
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

/** `of` pages of a part of the passport, numbered from 0. */
const chapterPagesOf = (kind: PassportChapter, of: number): readonly PassportPage[] =>
	Array.from({ length: of }, (_page, index): PassportPage => ({ index, kind, of }));

/**
 * The passport's pages in order: the cover, the identity page, a page for every two visas, if the
 * map has earned any, then for every two within reach, if any are, then a page for every six stamps,
 * with at least one to say where stamps come from.
 */
export const passportPagesAtom = atom<readonly PassportPage[]>((get) => {
	const stampPages = Math.max(1, Math.ceil(get(passportStampsAtom).length / STAMPS_PER_PAGE));
	return [
		{ kind: "cover" },
		{ kind: "identity" },
		...chapterPagesOf("visas", Math.ceil(get(visasAtom).length / VISAS_PER_PAGE)),
		...chapterPagesOf("locked", Math.ceil(get(lockedVisasAtom).length / VISAS_PER_PAGE)),
		...chapterPagesOf("stamps", stampPages),
	];
});

/** Where each part of the passport it has pages for starts, in order. */
export const passportChaptersAtom = atom<readonly PassportChapterStart[]>((get) =>
	get(passportPagesAtom).flatMap((page, index): PassportChapterStart[] =>
		"index" in page && page.index === 0 ? [{ chapter: page.kind, page: index }] : [],
	),
);

/** How many pages the passport has. */
export const passportPageCountAtom = atom((get) => get(passportPagesAtom).length);

/** The page the passport is open at, the cover being the first. */
export const passportPageAtom = atom(0);

/**
 * The page on the left of the spread `page` is in. The cover is shut, on its own; after it, the
 * identity page is on the left, facing the first page of visas, and so on in pairs.
 */
const leftPageOf = (page: number): number => (page === 0 ? 0 : page - ((page + 1) % 2));

/** The pages the passport is open at, each in a spread with the one facing it where it lies open. */
const openPagesOf = (page: number, spread: boolean): readonly number[] =>
	spread && page > 0 ? [leftPageOf(page), leftPageOf(page) + 1] : [page];

/**
 * What the passport shows, open at the page it is, as it lies: a page at a time, or two at a time
 * where `spread`. Whether it lies open is the screen's to say, which is read as it renders, so it
 * is asked for rather than held here.
 */
export const passportOpeningOfAtom = atom((get) => {
	const pages = get(passportPagesAtom);
	const page = get(passportPageAtom);
	return (spread: boolean): PassportOpening => {
		const open = openPagesOf(page, spread);
		return {
			shown: open.map((index) => pages[index] ?? null),
			turns: {
				back: (open[0] ?? 0) > 0,
				forward: (open.at(-1) ?? 0) < pages.length - 1,
			},
		};
	};
});

/**
 * Turns the passport's pages by `by`, forwards or back, a spread at a time where it lies open, and
 * stopping at either cover. Any visa showing its back is turned over again.
 */
export const turnPassportPageAtom = atom(undefined, (get, set, { by, spread }: PassportTurn) => {
	const last = get(passportPageCountAtom) - 1;
	const from = spread ? leftPageOf(get(passportPageAtom)) : get(passportPageAtom);
	const page = Math.min(Math.max(from + (spread ? by * 2 : by), 0), last);
	set(passportPageAtom, spread ? leftPageOf(page) : page);
	set(flippedVisaAtom, null);
});

/**
 * Opens the passport straight at the page `page`, at the spread it lies in where it lies open, with
 * every visa the right way up.
 */
export const jumpToPassportPageAtom = atom(undefined, (_get, set, page: number) => {
	set(passportPageAtom, page);
	set(flippedVisaAtom, null);
});

/** Opens the passport at its cover, with every visa the right way up. */
export const openPassportAtom = atom(undefined, (_get, set) => {
	set(passportPageAtom, 0);
	set(flippedVisaAtom, null);
});
