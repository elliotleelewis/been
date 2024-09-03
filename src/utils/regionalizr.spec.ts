import { describe, expect, it } from 'vitest';

import { type Country } from '../models/country';
import { type Region } from '../models/region';

import { regionalizer } from './regionalizer';

describe('regionalizer', () => {
	it('should correctly group countries by region', () => {
		const countries: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 2' },
			{ name: 'Country C', iso3166: 'C', region: 'Region 1' },
			{ name: 'Country D', iso3166: 'D', region: 'Region 2' },
		];

		const expected: readonly Region[] = [
			{
				name: 'Region 1',
				values: [
					{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
					{ name: 'Country C', iso3166: 'C', region: 'Region 1' },
				],
			},
			{
				name: 'Region 2',
				values: [
					{ name: 'Country B', iso3166: 'B', region: 'Region 2' },
					{ name: 'Country D', iso3166: 'D', region: 'Region 2' },
				],
			},
		];

		const result = regionalizer(countries);
		expect(result).toEqual(expected);
	});

	it('should handle an empty array', () => {
		const countries: readonly Country[] = [];
		const result = regionalizer(countries);
		expect(result).toEqual([]);
	});

	it('should correctly handle single country in each region', () => {
		const countries: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 2' },
			{ name: 'Country C', iso3166: 'C', region: 'Region 3' },
		];

		const expected: readonly Region[] = [
			{
				name: 'Region 1',
				values: [
					{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
				],
			},
			{
				name: 'Region 2',
				values: [
					{ name: 'Country B', iso3166: 'B', region: 'Region 2' },
				],
			},
			{
				name: 'Region 3',
				values: [
					{ name: 'Country C', iso3166: 'C', region: 'Region 3' },
				],
			},
		];

		const result = regionalizer(countries);
		expect(result).toEqual(expected);
	});

	it('should not mutate the original array', () => {
		const countries: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 1' },
		];

		regionalizer(countries);
		expect(countries).toEqual([
			{ name: 'Country A', iso3166: 'A', region: 'Region 1' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 1' },
		]);
	});
});
