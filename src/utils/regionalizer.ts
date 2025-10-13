import type { Country } from "../models/country";
import type { Region } from "../models/region";

export const regionalizer = (
	countries: readonly Country[],
): readonly Region[] => {
	const regionMap = new Map<string, Country[]>();
	for (const country of countries) {
		if (regionMap.has(country.region)) {
			regionMap.get(country.region)?.push(country);
		} else {
			regionMap.set(country.region, [country]);
		}
	}

	return [...regionMap.entries()]
		.map(([regionName, values]) => ({
			complete: values.filter((c) => c.selected).length / values.length,
			name: regionName,
			values: values.toSorted((a, b) => a.name.localeCompare(b.name)),
		}))
		.toSorted((a, b) => {
			if (a.name === "") {
				return 1;
			}
			if (b.name === "") {
				return -1;
			}

			return a.name.localeCompare(b.name);
		});
};
