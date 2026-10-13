import { atom } from "jotai";

import { landmassBoundsOf } from "../data/boundaries.ts";
import type { Country, Visits } from "../models/country.ts";
import type { PassportStamp } from "../models/passport.ts";
import { silhouetteOf } from "../utils/silhouette.ts";
import { stampDesignOf } from "../utils/stamp.ts";
import { countriesAtom, focusAtom, localesAtom, shownVisitsAtom } from "./atoms.ts";
import { boundariesAtom } from "./dataset.ts";
import { passportDateOfAtom } from "./dates.ts";

/** The square a stamp's silhouette is drawn in, in SVG units. */
const SILHOUETTE_SIZE = 100;

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
	const dateOf = get(passportDateOfAtom);
	return get(countriesAtom)
		.filter(({ selected }) => selected === true)
		.toSorted(byStampOrder(visits, locales))
		.map((country): PassportStamp => {
			const boundary = boundaries.get(country.iso3166);
			return {
				country,
				date: dateOf(visits[country.iso3166]?.at),
				design: stampDesignOf(country.iso3166, country.region),
				silhouette:
					boundary === undefined
						? undefined
						: silhouetteOf(boundary, landmassBoundsOf(boundary), SILHOUETTE_SIZE),
			};
		});
});

/** Frames a country on the globe, as tapping its stamp in the passport asks. */
export const showCountryAtom = atom(undefined, (_get, set, country: Country) => {
	set(focusAtom, { country, type: "country" });
});
