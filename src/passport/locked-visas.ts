import { atom } from "jotai";

import { isEarned, remainingFor, requiredFor } from "../core/achievements.ts";
import { countriesAtom } from "../core/countries.ts";
import { achievementsAtom } from "../core/dataset.ts";
import { recommendedCodesAtom } from "../core/recommended.ts";
import { shownVisitsAtom } from "../core/selection.ts";
import type { Achievement, Country, Visits } from "../core/types.ts";
import { LOCKED_VISA_COUNT } from "./types.ts";
import type { LockedVisa, LockedVisaGroup } from "./types.ts";
import { visaDesignOf } from "./visa-design.ts";

/** How far through an achievement `visits` are, from 0 for none of it to 1 for all of it. */
const progressOf = (achievement: Achievement, visits: Visits): number =>
	1 - remainingFor(achievement, visits) / requiredFor(achievement);

/**
 * The visas the map on show is nearest to being issued, nearest first, locked: each achievement it
 * has started on but not earned, by how far through it the map is, then by how few it still needs.
 * Each lists the requirements still to meet and the countries that would meet them, those
 * recommended next first, then by name.
 */
export const lockedVisasAtom = atom<readonly LockedVisa[]>((get) => {
	const visits = get(shownVisitsAtom);
	const recommended = new Set(get(recommendedCodesAtom));
	const countries = new Map(get(countriesAtom).map((country) => [country.iso3166, country]));
	const groupsOf = (achievement: Achievement): readonly LockedVisaGroup[] => {
		const labelled = achievement.requirements.length > 1;
		return achievement.requirements.flatMap(({ codes, count, label }) => {
			const open = codes
				.filter((code) => !Object.hasOwn(visits, code))
				.flatMap((code): Country[] => {
					const country = countries.get(code);
					return country === undefined ? [] : [country];
				})
				.map((country) => ({ country, recommended: recommended.has(country.iso3166) }))
				.toSorted(
					(one, other) =>
						Number(other.recommended) - Number(one.recommended) ||
						one.country.name.localeCompare(other.country.name),
				);
			const need = count - (codes.length - open.length);
			return need > 0 ? [{ label: labelled ? label : undefined, need, open }] : [];
		});
	};
	return get(achievementsAtom)
		.filter((achievement) => !isEarned(achievement, visits))
		.map((achievement) => ({ achievement, progress: progressOf(achievement, visits) }))
		.filter(({ progress }) => progress > 0)
		.toSorted(
			(one, other) =>
				other.progress - one.progress ||
				remainingFor(one.achievement, visits) - remainingFor(other.achievement, visits) ||
				one.achievement.id.localeCompare(other.achievement.id),
		)
		.slice(0, LOCKED_VISA_COUNT)
		.map(({ achievement }) => ({
			achievement,
			date: undefined,
			design: visaDesignOf(achievement),
			groups: groupsOf(achievement),
			remaining: remainingFor(achievement, visits),
		}));
});
