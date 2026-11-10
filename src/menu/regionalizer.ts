import { M49_REGIONS, M49_SUBREGIONS } from "../core/m49.ts";
import type { M49Region, M49Subregion } from "../core/m49.ts";
import type { Country } from "../core/types.ts";
import type { Continent, Region } from "./types.ts";

const groupBy = <Key, Value>(
	values: readonly Value[],
	keyOf: (value: Value) => Key,
): ReadonlyMap<Key, readonly Value[]> => {
	const groups = new Map<Key, Value[]>();
	for (const value of values) {
		const key = keyOf(value);
		const group = groups.get(key);
		if (group === undefined) {
			groups.set(key, [value]);
		} else {
			group.push(value);
		}
	}
	return groups;
};

const selectedIn = (countries: readonly Country[]): number =>
	countries.filter((country) => country.selected === true).length;

/**
 * How many of `countries` are on the reader's own map, while a shared map is set against it, which
 * is while any country has a standing.
 */
const mineIn = (countries: readonly Country[]): number =>
	countries.filter(({ standing }) => standing === "both" || standing === "mine").length;

/** Whether a shared map is being set against the reader's own, as it is once any country has a standing. */
const comparing = (countries: readonly Country[]): boolean =>
	countries.some(({ standing }) => standing !== undefined);

/**
 * Groups countries into their M49 regions and, inside those, their sub-regions, ordered as the
 * reader's language would. The reader's home region, when there is a guess at it, comes first.
 */
export const regionalizer = (
	countries: readonly Country[],
	collator: Intl.Collator,
	homeRegion?: M49Region,
): readonly Continent[] => {
	const compared = comparing(countries);
	const toRegion = (subregion: M49Subregion, values: readonly Country[]): Region => ({
		complete: selectedIn(values) / values.length,
		...(compared ? { mine: mineIn(values) / values.length } : {}),
		name: M49_SUBREGIONS[subregion](),
		values: values.toSorted((left, right) => collator.compare(left.name, right.name)),
	});

	const toContinent = (code: M49Region, values: readonly Country[]): Continent => ({
		code,
		...(compared ? { mine: mineIn(values) } : {}),
		name: M49_REGIONS[code](),
		total: values.length,
		values: [...groupBy(values, ({ subregion }) => subregion)]
			.map(([subregion, members]) => toRegion(subregion, members))
			.toSorted((left, right) => collator.compare(left.name, right.name)),
		visited: selectedIn(values),
	});

	const continents = [...groupBy(countries, ({ region }) => region)].map(([code, values]) =>
		toContinent(code, values),
	);

	return continents.toSorted(
		(left, right) =>
			Number(right.code === homeRegion) - Number(left.code === homeRegion) ||
			collator.compare(left.name, right.name),
	);
};
