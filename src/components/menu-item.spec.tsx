import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CountriesContext } from '../contexts/countries-context.ts';
import { MenuItem } from './menu-item.ts';

describe('MenuItem', () => {
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
				<MenuItem
					country={{
						name: 'United Kingdom',
						iso3166: 'GB',
						region: 'Europe',
					}}
				/>
			</CountriesContext.Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
