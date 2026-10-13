import { atom } from "jotai";

import type { VisaMoment } from "../models/achievement.ts";
import type { StampMoment } from "../models/passport.ts";
import { newlyEarned } from "../utils/achievements.ts";
import { achievementsAtom } from "./achievements.ts";
import { addCountryAtom, visitsAtom } from "./atoms.ts";
import { viewingSharedMapAtom } from "./location.ts";

/** The country whose stamp is being pressed onto the screen, while it is. */
export const stampMomentAtom = atom<StampMoment | null>(null);

/** The visas being stuck in after a stamp that earned them, while they are. */
export const visaMomentAtom = atom<VisaMoment | null>(null);

/**
 * Plays the stamp moment for a country the reader has just ticked, noting any achievements the tick
 * earned, whose visa moment follows it. It cuts short any moment still playing.
 */
export const announceStampAtom = atom(undefined, (get, set, code: string) => {
	const visas = newlyEarned(get(achievementsAtom), get(visitsAtom), code).map(({ id }) => id);
	set(visaMomentAtom, null);
	set(stampMomentAtom, { code, id: (get(stampMomentAtom)?.id ?? 0) + 1, visas });
});

/**
 * Ends the stamp moment, unless another has already taken its place, and starts the visa moment
 * for whatever it earned.
 */
export const endStampMomentAtom = atom(undefined, (get, set, id: number) => {
	const moment = get(stampMomentAtom);
	if (moment?.id !== id) {
		return;
	}
	set(stampMomentAtom, null);
	if (moment.visas.length > 0) {
		set(visaMomentAtom, { id, ids: moment.visas });
	}
});

/** Ends the visa moment, unless another has already taken its place. */
export const endVisaMomentAtom = atom(undefined, (get, set, id: number) => {
	if (get(visaMomentAtom)?.id === id) {
		set(visaMomentAtom, null);
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
