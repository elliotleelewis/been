import { atom } from "jotai";

import { landmassBoundsOf } from "../data/boundaries.ts";
import type { Country, Visits } from "../models/country.ts";
import { M49_REGIONS } from "../models/m49.ts";
import { STAMPS_PER_PAGE } from "../models/passport.ts";
import type { PassportStamp, PassportStats } from "../models/passport.ts";
import { silhouetteOf } from "../utils/silhouette.ts";
import { stampDesignOf } from "../utils/stamp.ts";
import { countriesAtom, focusAtom, localesAtom, shownVisitsAtom } from "./atoms.ts";
import { boundariesAtom } from "./dataset.ts";
import { homeRegionAtom } from "./regions.ts";

/** The square a stamp's silhouette is drawn in, in SVG units. */
const SILHOUETTE_SIZE = 100;
/** The cover and the identity page come before the first page of stamps. */
const PAGES_BEFORE_STAMPS = 2;

const boundaryByCodeAtom = atom(
	(get) =>
		new Map(
			get(boundariesAtom).features.map((boundary) => [boundary.properties.iso_3166_1, boundary]),
		),
);

/**
 * Orders countries as their stamps went in: those ticked before dates were kept first, by name,
 * then the rest by the day they were ticked.
 */
const byStampOrder =
	(visits: Visits, locales: readonly string[]) =>
	(one: Country, other: Country): number =>
		(visits[one.iso3166]?.at ?? "").localeCompare(visits[other.iso3166]?.at ?? "") ||
		one.name.localeCompare(other.name, locales);

/** The stamps in the passport of whichever map is on show, in the order they went in. */
export const passportStampsAtom = atom<readonly PassportStamp[]>((get) => {
	const visits = get(shownVisitsAtom);
	const locales = get(localesAtom);
	const boundaries = get(boundaryByCodeAtom);
	const dates = new Intl.DateTimeFormat(locales, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	return get(countriesAtom)
		.filter(({ selected }) => selected === true)
		.toSorted(byStampOrder(visits, locales))
		.map((country): PassportStamp => {
			const at = visits[country.iso3166]?.at;
			const boundary = boundaries.get(country.iso3166);
			return {
				country,
				date: at === undefined ? undefined : dates.format(new Date(`${at}T00:00:00`)).toUpperCase(),
				design: stampDesignOf(country.iso3166, country.region),
				silhouette:
					boundary === undefined
						? undefined
						: silhouetteOf(boundary, landmassBoundsOf(boundary), SILHOUETTE_SIZE),
			};
		});
});

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
	};
});

/** How many pages the passport has: the cover, the identity page, and at least one of stamps. */
export const passportPageCountAtom = atom(
	(get) =>
		PAGES_BEFORE_STAMPS + Math.max(1, Math.ceil(get(passportStampsAtom).length / STAMPS_PER_PAGE)),
);

/** The page the passport is open at, the cover being the first. */
export const passportPageAtom = atom(0);

/** Turns the passport's pages by `by`, forwards or back, stopping at either cover. */
export const turnPassportPageAtom = atom(undefined, (get, set, by: number) => {
	const last = get(passportPageCountAtom) - 1;
	const page = get(passportPageAtom) + by;
	set(passportPageAtom, Math.min(Math.max(page, 0), last));
});

/** Frames a country on the globe, as tapping its stamp in the passport asks. */
export const showCountryAtom = atom(undefined, (_get, set, country: Country) => {
	set(focusAtom, { country, type: "country" });
});
