import { atom } from "jotai";

import type { Tap } from "../models/tap.ts";
import { visitOn, withoutVisit } from "../utils/visits.ts";
import { removeCountryAtom, visitsAtom } from "./atoms.ts";
import { viewingSharedMapAtom } from "./location.ts";

/** The last tap on the globe, for as long as it can still be undone. */
export const lastTapAtom = atom<Tap | null>(null);

/**
 * Ticks or unticks a country tapped on the globe. Unlike a tick in the list, it leaves the camera
 * where it is, because the reader is already looking at the country they tapped. A tap is easy to
 * make by mistake, so it is kept for an undo.
 */
export const tapCountryAtom = atom(undefined, (get, set, code: string) => {
	if (get(viewingSharedMapAtom)) {
		return;
	}
	const visits = get(visitsAtom);
	const previous = visits[code];
	set(lastTapAtom, { code, previous });
	if (previous === undefined) {
		set(visitsAtom, { ...visits, [code]: visitOn(new Date()) });
	} else {
		set(removeCountryAtom, code);
	}
});

/** Puts the last tapped country back the way it was, visit and all. */
export const undoTapAtom = atom(undefined, (get, set) => {
	const tap = get(lastTapAtom);
	if (tap === null) {
		return;
	}
	const visits = get(visitsAtom);
	set(lastTapAtom, null);
	set(
		visitsAtom,
		tap.previous === undefined
			? withoutVisit(visits, tap.code)
			: { ...visits, [tap.code]: tap.previous },
	);
});
