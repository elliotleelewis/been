import { atom } from "jotai";

import { earnedOn, isEarned } from "../core/achievements.ts";
import { achievementsAtom } from "../core/dataset.ts";
import { shownVisitsAtom } from "../core/selection.ts";
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
