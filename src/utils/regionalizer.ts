import type { Country } from "../models/country";
import { M49_REGIONS, M49_SUBREGIONS } from "../models/m49";
import type { M49Subregion } from "../models/m49";
import type { Region } from "../models/region";

// Groups countries by their M49 sub-region, keeping the sub-regions of one M49 region together,
// and orders everything as the reader's language would.
export const regionalizer = (
	countries: readonly Country[],
	collator: Intl.Collator,
): readonly Region[] => {
	const regionMap = new Map<M49Subregion, Country[]>();
	for (const country of countries) {
		if (regionMap.has(country.subregion)) {
			regionMap.get(country.subregion)?.push(country);
		} else {
			regionMap.set(country.subregion, [country]);
		}
	}

	const entries: readonly (readonly [M49Subregion, readonly Country[]])[] = [
		...regionMap.entries(),
	];
	const regions = entries.map(([subregion, values]) => ({
		complete: values.filter((country) => country.selected === true).length / values.length,
		name: M49_SUBREGIONS[subregion],
		parent: values[0] === undefined ? "" : M49_REGIONS[values[0].region],
		values: values.toSorted((left, right) => collator.compare(left.name, right.name)),
	}));

	return regions
		.toSorted(
			(left, right) =>
				collator.compare(left.parent, right.parent) || collator.compare(left.name, right.name),
		)
		.map(({ complete, name, values }): Region => ({ complete, name, values }));
};
