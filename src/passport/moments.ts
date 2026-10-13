import { atom } from "jotai";

import { visitsAtom } from "../core/selection.ts";
import { endStampMomentAtom, stampMomentAtom } from "../core/ticking.ts";
import { newlyEarned } from "./achievements.ts";
import type { VisaMoment } from "./types.ts";
import { achievementsAtom } from "./visas.ts";

/** The visas being stuck in after a stamp that earned them, while they are. */
export const visaMomentAtom = atom<VisaMoment | null>(null);

/**
 * The visa moment, unless a newer stamp has taken the screen; whatever that stamp earns replaces
 * it once the stamp has landed.
 */
export const shownVisaMomentAtom = atom((get) =>
	get(stampMomentAtom) === null ? get(visaMomentAtom) : null,
);

/**
 * Lands a stamp in the passport, ending its moment, unless another has already taken its place,
 * and starts the visa moment for any achievements its tick earned.
 */
export const landStampAtom = atom(undefined, (get, set, id: number) => {
	const moment = get(stampMomentAtom);
	if (moment?.id !== id) {
		return;
	}
	set(endStampMomentAtom, id);
	const earned = newlyEarned(get(achievementsAtom), get(visitsAtom), moment.code);
	set(visaMomentAtom, earned.length === 0 ? null : { id, ids: earned.map((visa) => visa.id) });
});

/** Ends the visa moment, unless another has already taken its place. */
export const endVisaMomentAtom = atom(undefined, (get, set, id: number) => {
	if (get(visaMomentAtom)?.id === id) {
		set(visaMomentAtom, null);
	}
});
