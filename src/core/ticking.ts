import { atom } from "jotai";

import { countriesAtom } from "./countries.ts";
import { viewingSharedMapAtom } from "./location.ts";
import { focusAtom, visitsAtom } from "./selection.ts";
import type { StampMoment } from "./types.ts";
import { visitOn, withoutVisit } from "./visits.ts";

/** Ticks a country, dated today, and asks the camera to frame it. */
export const addCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	const visits = get(visitsAtom);
	if (!get(viewingSharedMapAtom) && !Object.hasOwn(visits, countryCode)) {
		const countries = get(countriesAtom);
		const focusCountry = countries.find((country) => country.iso3166 === countryCode);
		set(focusAtom, focusCountry ? { country: focusCountry, type: "country" } : null);
		set(visitsAtom, { ...visits, [countryCode]: visitOn(new Date()) });
	}
});

/** Unticks a country, putting the camera back if it was framing that country. */
export const removeCountryAtom = atom(undefined, (get, set, countryCode: string) => {
	if (get(viewingSharedMapAtom)) {
		return;
	}
	const visits = get(visitsAtom);
	const focus = get(focusAtom);

	// Unselecting the country the map is currently framing is an undo of that selection, so ask
	// the map to go back to where it was rather than leaving the user stranded on a country they
	// no longer have selected. Unselecting anything else just leaves the camera alone.
	const undo = focus?.type === "country" && focus.country.iso3166 === countryCode;
	set(focusAtom, undo ? { type: "undo" } : null);
	set(visitsAtom, withoutVisit(visits, countryCode));
});

/**
 * The country whose stamp is being pressed onto the screen, while it is. Ticking only starts the
 * moment; the passport plays it, and decides what follows once the stamp has landed.
 */
export const stampMomentAtom = atom<StampMoment | null>(null);

/** How many stamp moments have started, so each has an id no other shares. */
const stampCountAtom = atom(0);

/** Plays the stamp moment for a country the reader has just ticked, cutting short any playing. */
export const announceStampAtom = atom(undefined, (get, set, code: string) => {
	const id = get(stampCountAtom) + 1;
	set(stampCountAtom, id);
	set(stampMomentAtom, { code, id });
});

/** Ends the stamp moment, unless another has already taken its place. */
export const endStampMomentAtom = atom(undefined, (get, set, id: number) => {
	if (get(stampMomentAtom)?.id === id) {
		set(stampMomentAtom, null);
	}
});

/**
 * Ticks a country as the reader asked for it, from the list or the search box, and stamps it.
 * Only a tick that adds a country is stamped: nothing on a shared map, and nothing ticked already.
 */
export const stampCountryAtom = atom(undefined, (get, set, code: string) => {
	if (get(viewingSharedMapAtom) || Object.hasOwn(get(visitsAtom), code)) {
		return;
	}
	set(addCountryAtom, code);
	set(announceStampAtom, code);
});
