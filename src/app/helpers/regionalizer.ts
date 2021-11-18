import { Country } from '../models/country';
import { Region } from '../models/region';

export const regionalizer = (arr: Country[]): Region[] =>
	arr.reduce((prev: Region[], current) => {
		const item = prev.find((i) => i.name === current.region);
		if (item) {
			item.values.push(current);
		} else {
			prev.push({ name: current.region, values: [current] });
		}
		return prev;
	}, []);
