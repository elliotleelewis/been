import type { Country } from "../models/country";
import type { Region } from "../models/region";

// Groups countries by their M49 sub-region, keeping the sub-regions of one M49 region together.
export const regionalizer = (countries: readonly Country[]): readonly Region[] => {
	const regionMap = new Map<string, Country[]>();
	for (const country of countries) {
		if (regionMap.has(country.subregion)) {
			regionMap.get(country.subregion)?.push(country);
		} else {
			regionMap.set(country.subregion, [country]);
		}
	}

	const entries: readonly (readonly [string, readonly Country[]])[] = [...regionMap.entries()];
	const regions = entries.map(([regionName, values]) => ({
		complete: values.filter((country) => country.selected === true).length / values.length,
		name: regionName,
		parent: values[0]?.region ?? "",
		values: values.toSorted((left, right) => left.name.localeCompare(right.name)),
	}));

	return regions
		.toSorted(
			(left, right) =>
				left.parent.localeCompare(right.parent) || left.name.localeCompare(right.name),
		)
		.map(({ complete, name, values }): Region => ({ complete, name, values }));
};
