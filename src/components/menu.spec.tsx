import { render } from '@testing-library/react';
import {
	type MockInstance,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { useCountries } from '../contexts/countries-context';
import { Menu } from './menu';

describe('Menu', () => {
	beforeEach(() => {
		vi.mock(import('../contexts/countries-context'), () => ({
			useCountries: vi.fn(() => ({
				countries: [],
				regions: [],
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

	it('should render with a country', () => {
		vi.mocked(useCountries, { partial: true }).mockReturnValue({
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
		});
		const result = render(<Menu header={<div>Header!</div>} />);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
