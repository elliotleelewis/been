import { render } from '@testing-library/react';
import { createRef } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { CountriesContext } from '../contexts/countries-context';
import countriesJson from '../data/countries.json';
import { MapboxSourceKeys } from '../models/enums';

import { Map, type MapForwardedRef } from './map';

describe('Map', () => {
	beforeAll(() => {
		vi.spyOn(window, 'matchMedia').mockImplementation(
			() =>
				({
					matches: false,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				}) satisfies Partial<MediaQueryList> as unknown as MediaQueryList,
		);
	});

	it('should render', () => {
		const result = render(
			<CountriesContext.Provider
				value={{
					countries: [],
					regions: [],
					focus: null,
					addCountry: vi.fn(),
					removeCountry: vi.fn(),
					clearCountries: vi.fn(),
				}}
			>
				<Map header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should accept a ref', () => {
		const map = createRef<MapForwardedRef>();
		const result = render(
			<CountriesContext.Provider
				value={{
					countries: [],
					regions: [],
					focus: null,
					addCountry: vi.fn(),
					removeCountry: vi.fn(),
					clearCountries: vi.fn(),
				}}
			>
				<Map ref={map} header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		expect(map.current).toBeTruthy();
		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should have geojson data for every country in dataset', async () => {
		const map = createRef<MapForwardedRef>();
		render(
			<CountriesContext.Provider
				value={{
					countries: [],
					regions: [],
					focus: null,
					addCountry: vi.fn(),
					removeCountry: vi.fn(),
					clearCountries: vi.fn(),
				}}
			>
				<Map ref={map} header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		await vi.waitUntil(
			() => map.current?.isSourceLoaded(MapboxSourceKeys.countries),
			{
				timeout: 5000,
			},
		);

		expect(map.current?.querySourceFeatures).toBeTruthy();
		for (const { iso3166, name } of countriesJson) {
			const features = map.current?.querySourceFeatures(
				MapboxSourceKeys.countries,
				{
					sourceLayer: 'country_boundaries',
					filter: ['==', ['get', 'iso_3166_1'], iso3166],
				},
			);
			expect.soft(features?.length, name).toBeGreaterThanOrEqual(1);
		}
	});
});
