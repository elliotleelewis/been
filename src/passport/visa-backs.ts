import { atom } from "jotai";

import { countriesAtom } from "../core/countries.ts";
import { earnersOf } from "../core/earners.ts";
import { shownVisitsAtom } from "../core/selection.ts";
import { m } from "../paraglide/messages.js";
import { passportDateOfAtom } from "./dates.ts";
import { sharedSidesAtom } from "./shared-sides.ts";
import { passportStampsAtom } from "./stamps.ts";
import type { Visa, VisaBack, VisaBackSide, VisaEntry } from "./types.ts";
import { visasAtom } from "./visas.ts";

// The achievement and country types are reached through the passport's own, to keep this file's
// imports few.
type Achievement = Visa["achievement"];
type Country = VisaEntry["country"];

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
	const sharedSides = get(sharedSidesAtom);
	const countries = new Map(get(countriesAtom).map((country) => [country.iso3166, country]));
	const stamps = new Map(get(passportStampsAtom).map((stamp) => [stamp.country.iso3166, stamp]));
	const countriesOf = (codes: readonly string[]): readonly Country[] =>
		codes.flatMap((code) => countries.get(code) ?? []);
	const ownSideOf = (achievement: Achievement, clincher: string | undefined): VisaBackSide => {
		const stamp = clincher === undefined ? undefined : stamps.get(clincher);
		return stamp === undefined
			? { kind: "undated" }
			: { caption: clinchedCaptionOf(achievement), kind: "clincher", stamp };
	};
	return new Map(
		get(visasAtom).map(({ achievement }): [string, VisaBack] => {
			const { clincher, requirements } = earnersOf(achievement, visits);
			const labelled = requirements.length > 1;
			return [
				achievement.id,
				{
					groups: requirements.map(({ earned, extra }, index) => ({
						earned: countriesOf(earned).map((country) => ({
							country,
							date: dateOf(visits[country.iso3166]?.at),
						})),
						extra: achievement.kind === "milestone" ? [] : countriesOf(extra),
						label: labelled ? achievement.requirements[index]?.label : undefined,
					})),
					side: sharedSides?.get(achievement.id) ?? ownSideOf(achievement, clincher),
				},
			];
		}),
	);
});
