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

	it('should sort the regions', () => {
		const countries: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: 'Region 2' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 3' },
			{ name: 'Country C', iso3166: 'C', region: 'Region 1' },
		];

		const result = regionalizer(countries);
		expect(result[0]?.name).toBe('Region 1');
		expect(result[1]?.name).toBe('Region 2');
		expect(result[2]?.name).toBe('Region 3');
	});

	it('should sort an empty region name', () => {
		const countriesA: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: 'Region 2' },
			{ name: 'Country B', iso3166: 'B', region: '' },
			{ name: 'Country C', iso3166: 'C', region: 'Region 1' },
		];

		const resultA = regionalizer(countriesA);
		expect(resultA[0]?.name).toBe('Region 1');
		expect(resultA[1]?.name).toBe('Region 2');
		expect(resultA[2]?.name).toBe('');

		const countriesB: readonly Country[] = [
			{ name: 'Country A', iso3166: 'A', region: '' },
			{ name: 'Country B', iso3166: 'B', region: 'Region 1' },
			{ name: 'Country C', iso3166: 'C', region: 'Region 2' },
		];

		const resultB = regionalizer(countriesB);
		expect(resultB[0]?.name).toBe('Region 1');
		expect(resultB[1]?.name).toBe('Region 2');
		expect(resultB[2]?.name).toBe('');
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
