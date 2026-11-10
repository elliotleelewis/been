import { atom } from "jotai";

import { earnedOn, isEarned, remainingFor } from "../core/achievements.ts";
import { comparisonAtom } from "../core/comparison.ts";
import { collatorAtom, countriesAtom } from "../core/countries.ts";
import { viewingSharedMapAtom } from "../core/location.ts";
import { visitsAtom } from "../core/selection.ts";
import type { Achievement, Country, Visits } from "../core/types.ts";
import { passportDateOfAtom } from "./dates.ts";
import type { VisaBackSide } from "./types.ts";
import { visasAtom } from "./visas.ts";

/** What a visa's side is worked out from, on a shared map set against the reader's own. */
interface Against {
	/** The reader's own visits. */
	readonly mine: Visits;
	/** The shared map's countries new to the reader, by name. */
	readonly theirs: readonly Country[];
	readonly dateOf: (at: string | undefined) => string | undefined;
}

/**
 * The countries on a shared map that the reader's own still needs for an achievement, as many as
 * each requirement still needs, by name. The shared map earned the visa, so its countries are
 * always enough.
 */
const stillToGo = ({ requirements }: Achievement, { mine, theirs }: Against): readonly Country[] =>
	requirements.flatMap(({ codes, count }) => {
		const need = count - codes.filter((code) => Object.hasOwn(mine, code)).length;
		const open = new Set(codes);
		return need > 0 ? theirs.filter(({ iso3166 }) => open.has(iso3166)).slice(0, need) : [];
	});

/** How the reader's own map stands on a visa a shared map holds: held too, or so many away. */
const sideOf = (achievement: Achievement, against: Against): VisaBackSide =>
	isEarned(achievement, against.mine)
		? { date: against.dateOf(earnedOn(achievement, against.mine)), kind: "held" }
		: {
				countries: stillToGo(achievement, against),
				kind: "within",
				remaining: remainingFor(achievement, against.mine),
			};

/**
 * What the left of the back of each visa on a shared map shows, by its achievement's id, in place
 * of the stamp that clinched it, which a shared map, carrying no dates, cannot tell. With a map of
 * the reader's own set against it, it is how theirs stands on the visa; without, only why there is
 * no telling. Off a shared map, there is none.
 */
export const sharedSidesAtom = atom<ReadonlyMap<string, VisaBackSide> | null>((get) => {
	if (!get(viewingSharedMapAtom)) {
		return null;
	}
	const comparison = get(comparisonAtom);
	const collator = get(collatorAtom);
	const against: Against = {
		dateOf: get(passportDateOfAtom),
		mine: get(visitsAtom),
		theirs: get(countriesAtom)
			.filter(({ standing }) => standing === "theirs")
			.toSorted((one, other) => collator.compare(one.name, other.name)),
	};
	return new Map(
		get(visasAtom).map(({ achievement }): [string, VisaBackSide] => [
			achievement.id,
			comparison === null ? { kind: "shared" } : sideOf(achievement, against),
		]),
	);
});
