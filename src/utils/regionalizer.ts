import type { Country } from '../models/country.ts';
import type { Region } from '../models/region.ts';

export const regionalizer = (arr: readonly Country[]): readonly Region[] =>
	arr
		.reduce((prev: Region[], current) => {
			const item = prev.find((i) => i.name === current.region);
			if (item) {
				item.values.push(current);
			} else {
				prev.push({ name: current.region, values: [current] });
			}
			return prev;
		}, [])
		.map(({ name, values }) => ({
			name,
			values: values.sort(({ name: aName }, { name: bName }) =>
				aName.localeCompare(bName),
			),
		}))
		.sort(({ name: aName }, { name: bName }) => {
			if (aName === '') {
				return 1;
			}
			if (bName === '') {
				return -1;
			}

			return aName.localeCompare(bName);
		});
