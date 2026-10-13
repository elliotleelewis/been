import { atom } from "jotai";

import type { StampMoment } from "../models/passport.ts";
import { addCountryAtom, visitsAtom } from "./atoms.ts";
import { viewingSharedMapAtom } from "./location.ts";

/** The country whose stamp is being pressed onto the screen, while it is. */
export const stampMomentAtom = atom<StampMoment | null>(null);

/** Plays the stamp moment for a country the reader has just ticked. */
export const announceStampAtom = atom(undefined, (get, set, code: string) => {
	set(stampMomentAtom, { code, id: (get(stampMomentAtom)?.id ?? 0) + 1 });
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
