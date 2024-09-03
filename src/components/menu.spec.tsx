import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { CountriesContext } from '../contexts/countries-context';

import { Menu } from './menu';

describe('Menu', () => {
	test('it should render', () => {
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

		expect(result).toMatchSnapshot();
	});
});
