import { atom } from "jotai";

import { rawCountriesAtom } from "../core/dataset.ts";
import { shownVisitsAtom } from "../core/selection.ts";
import { achievementsOf, earnedOn, isEarned } from "./achievements.ts";
import { passportDateOfAtom } from "./dates.ts";
import type { Achievement, Visa } from "./types.ts";
import { visaDesignOf } from "./visa-design.ts";

/** Every achievement there is for the country list, none until it has loaded. */
export const achievementsAtom = atom<readonly Achievement[]>((get) =>
	achievementsOf(Object.values(get(rawCountriesAtom))),
);

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
