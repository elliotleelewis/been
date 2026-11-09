import { atom } from "jotai";

import { countriesAtom } from "../core/countries.ts";
import { M49_REGIONS } from "../core/m49.ts";
import { recommendationsAtom } from "../core/recommended.ts";
import type { Country, RecommendationReason } from "../core/types.ts";
import { m } from "../paraglide/messages.js";

/** How many of a recommendation's reasons are given beneath it, the strongest first. */
const REASONS_SHOWN = 2;

/** A country recommended in the menu, and why, in a few words. */
export interface NextUp {
	readonly country: Country;
	readonly why: string;
}

/** A reason to visit a country, as the menu says it, naming countries as `nameOf` does. */
const sayReason = (reason: RecommendationReason, nameOf: (code: string) => string): string => {
	if (reason.kind === "achievement") {
		return m.menu_next_achievement({ count: reason.remaining, title: reason.achievement.title });
	}
	return reason.kind === "neighbour"
		? m.menu_next_neighbour({ country: nameOf(reason.neighbour) })
		: m.menu_next_region({ region: M49_REGIONS[reason.region]() });
};

/** The countries the menu recommends visiting next, each with why, best first. */
export const nextUpAtom = atom<readonly NextUp[]>((get) => {
	const countries = new Map(get(countriesAtom).map((country) => [country.iso3166, country]));
	const nameOf = (code: string): string => countries.get(code)?.name ?? code;
	return get(recommendationsAtom).flatMap(({ code, reasons }) => {
		const country = countries.get(code);
		return country === undefined
			? []
			: [
					{
						country,
						why: reasons
							.slice(0, REASONS_SHOWN)
							.map((reason) => sayReason(reason, nameOf))
							.join(" · "),
					},
				];
	});
});
