import type { Country } from './country.ts';

export interface Region {
	name: string;
	values: Country[];
}
