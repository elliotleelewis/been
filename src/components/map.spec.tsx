import { render } from '@testing-library/react';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { CountriesContext } from '../contexts/countries-context';

import { Map } from './map';

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
				<Map header={<div>Header!</div>} />
			</CountriesContext.Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
