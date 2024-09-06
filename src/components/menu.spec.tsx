import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CountriesContext } from '../contexts/countries-context';

import { Menu } from './menu';

describe('Menu', () => {
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
				<Menu header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should render with a country', () => {
		const result = render(
			<CountriesContext.Provider
				value={{
					countries: [
						{
							name: 'United Kingdom',
							iso3166: 'GB',
							region: 'Europe',
						},
					],
					regions: [
						{
							name: 'Europe',
							values: [
								{
									name: 'United Kingdom',
									iso3166: 'GB',
									region: 'Europe',
								},
							],
						},
					],
					focus: null,
					addCountry: vi.fn(),
					removeCountry: vi.fn(),
					clearCountries: vi.fn(),
				}}
			>
				<Menu header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
