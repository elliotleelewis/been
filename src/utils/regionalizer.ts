import type { Country } from "../models/country";
import { M49_REGIONS, M49_SUBREGIONS } from "../models/m49";
import type { M49Region, M49Subregion } from "../models/m49";
import type { Continent, Region } from "../models/region";

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

// Groups countries into their M49 regions and, inside those, their sub-regions, ordered as the
// reader's language would. The reader's home region, when there is a guess at it, comes first.
export const regionalizer = (
	countries: readonly Country[],
	collator: Intl.Collator,
	homeRegion?: M49Region,
): readonly Continent[] => {
	const toRegion = (subregion: M49Subregion, values: readonly Country[]): Region => ({
		complete: selectedIn(values) / values.length,
		name: M49_SUBREGIONS[subregion],
		values: values.toSorted((left, right) => collator.compare(left.name, right.name)),
	});

	const continents = [...groupBy(countries, ({ region }) => region)].map(
		([code, values]): Continent => ({
			code,
			name: M49_REGIONS[code],
			total: values.length,
			values: [...groupBy(values, ({ subregion }) => subregion)]
				.map(([subregion, members]) => toRegion(subregion, members))
				.toSorted((left, right) => collator.compare(left.name, right.name)),
			visited: selectedIn(values),
		}),
	);

	return continents.toSorted(
		(left, right) =>
			Number(right.code === homeRegion) - Number(left.code === homeRegion) ||
			collator.compare(left.name, right.name),
	);
};
