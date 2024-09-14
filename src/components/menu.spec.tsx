import { render } from '@testing-library/react';
import {
	type MockInstance,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import type { useCountries } from '../contexts/countries-context.ts';
import { Menu } from './menu.ts';

describe('Menu', () => {
	beforeEach(() => {
		vi.mock(import('../contexts/countries-context.ts'), () => ({
			useCountries: vi.fn(() => ({
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
			})) satisfies MockInstance<typeof useCountries>,
		}));
	});

	it('should render', () => {
		const result = render(<Menu header={<div>Header!</div>} />);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
