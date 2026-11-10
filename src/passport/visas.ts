import { atom } from "jotai";

import { earnedOn, isEarned } from "../core/achievements.ts";
import { comparisonAtom } from "../core/comparison.ts";
import { achievementsAtom } from "../core/dataset.ts";
import { shownVisitsAtom, visitsAtom } from "../core/selection.ts";
import { passportDateOfAtom } from "./dates.ts";
import type { Visa } from "./types.ts";
import { visaDesignOf } from "./visa-design.ts";

/**
 * The visas in the passport of whichever map is on show: one for each achievement it has earned, in
 * the order they were earned, those earned by ticks older than dates being kept first.
 */
export const visasAtom = atom<readonly Visa[]>((get) => {
	const visits = get(shownVisitsAtom);
	const dateOf = get(passportDateOfAtom);
	return get(achievementsAtom)
		.filter((achievement) => isEarned(achievement, visits))
		.map((achievement) => ({ achievement, at: earnedOn(achievement, visits) ?? "" }))
		.toSorted((one, other) => one.at.localeCompare(other.at))
		.map(({ achievement, at }): Visa => ({
			achievement,
			date: dateOf(at === "" ? undefined : at),
			design: visaDesignOf(achievement),
		}));
});

/**
 * The achievements the reader's own map has earned, by id, while a shared map is set against it,
 * so the visas on show that the reader holds too can say so. There are none otherwise.
 */
export const heldVisaIdsAtom = atom<ReadonlySet<string>>((get) => {
	if (get(comparisonAtom) === null) {
		return new Set();
	}
	const mine = get(visitsAtom);
	return new Set(
		get(achievementsAtom)
			.filter((achievement) => isEarned(achievement, mine))
			.map(({ id }) => id),
	);
});
