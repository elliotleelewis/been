import { atom } from "jotai";

import { earnersOf } from "../core/achievements.ts";
import { countriesAtom } from "../core/countries.ts";
import { shownVisitsAtom } from "../core/selection.ts";
import type { Achievement, Country } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { passportDateOfAtom } from "./dates.ts";
import { passportStampsAtom } from "./stamps.ts";
import type { VisaBack } from "./types.ts";
import { visasAtom } from "./visas.ts";

/** The visa turned over to show its back, by its achievement's id, if one is. */
export const flippedVisaAtom = atom<string | null>(null);

/** The line beneath the stamp of the country that clinched a visa, saying what its tick was. */
const clinchedCaptionOf = ({ kind, requirements, title }: Achievement): string => {
	if (kind === "milestone") {
		return m.passport_visa_clinched_milestone({ count: requirements[0]?.count ?? 0 });
	}
	return kind === "region" || kind === "subregion"
		? m.passport_visa_clinched_area({ area: title })
		: m.passport_visa_clinched();
};

/**
 * What the back of each of the visas on show says, by its achievement's id. A milestone's back
 * lists no countries that also count, as every later stamp would.
 */
export const visaBacksAtom = atom<ReadonlyMap<string, VisaBack>>((get) => {
	const visits = get(shownVisitsAtom);
	const dateOf = get(passportDateOfAtom);
	const countries = new Map(get(countriesAtom).map((country) => [country.iso3166, country]));
	const stamps = new Map(get(passportStampsAtom).map((stamp) => [stamp.country.iso3166, stamp]));
	const countriesOf = (codes: readonly string[]): readonly Country[] =>
		codes.flatMap((code) => countries.get(code) ?? []);
	return new Map(
		get(visasAtom).map(({ achievement }): [string, VisaBack] => {
			const { clincher, requirements } = earnersOf(achievement, visits);
			const stamp = clincher === undefined ? undefined : stamps.get(clincher);
			const labelled = requirements.length > 1;
			return [
				achievement.id,
				{
					clincher:
						stamp === undefined ? undefined : { caption: clinchedCaptionOf(achievement), stamp },
					groups: requirements.map(({ earned, extra }, index) => ({
						earned: countriesOf(earned).map((country) => ({
							country,
							date: dateOf(visits[country.iso3166]?.at),
						})),
						extra: achievement.kind === "milestone" ? [] : countriesOf(extra),
						label: labelled ? achievement.requirements[index]?.label : undefined,
					})),
				},
			];
		}),
	);
});
