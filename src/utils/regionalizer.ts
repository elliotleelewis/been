import type { Country } from "../models/country";
import type { Region } from "../models/region";

export const regionalizer = (countries: readonly Country[]): readonly Region[] => {
	const regionMap = new Map<string, Country[]>();
	for (const country of countries) {
		if (regionMap.has(country.region)) {
			regionMap.get(country.region)?.push(country);
		} else {
			regionMap.set(country.region, [country]);
		}
	}

	const entries: readonly (readonly [string, readonly Country[]])[] = [...regionMap.entries()];
	const regions: readonly Region[] = entries.map(([regionName, values]) => ({
		complete: values.filter((country) => country.selected === true).length / values.length,
		name: regionName,
		values: values.toSorted((left, right) => left.name.localeCompare(right.name)),
	}));

	return regions.toSorted((left, right) => {
		if (left.name === "") {
			return 1;
		}
		if (right.name === "") {
			return -1;
		}

		return left.name.localeCompare(right.name);
	});
};
