import { type Country } from '../models/country';
import { type Region } from '../models/region';

export const regionalizer = (arr: readonly Country[]): readonly Region[] =>
	arr.reduce((prev: Region[], current) => {
		const item = prev.find((i) => i.name === current.region);
		if (item) {
			item.values.push(current);
		} else {
			prev.push({ name: current.region, values: [current] });
		}
		return prev;
	}, []);
