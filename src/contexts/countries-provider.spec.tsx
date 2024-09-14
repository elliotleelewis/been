import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Country } from '../models/country';

import {
	CountriesContext,
	type CountriesContextType,
} from './countries-context';
import { CountriesProvider } from './countries-provider';

const mockCountries = {
	['CA']: { name: 'Country A', iso3166: 'CA', region: 'Region 1' },
	['CB']: { name: 'Country B', iso3166: 'CB', region: 'Region 2' },
};

describe('CountriesContext', () => {
	beforeEach(() => {
		vi.mock(import('../hooks/use-local-storage'), () => ({
			useLocalStorage: vi.fn(() => [[], vi.fn()] as const),
		}));
	});

	const renderProvider = (data: Record<string, Country> = mockCountries) => {
		let contextValues: CountriesContextType | undefined;

		render(
			<CountriesProvider data={data}>
				<CountriesContext.Consumer>
					{(value) => {
						contextValues = value;
						return null;
					}}
				</CountriesContext.Consumer>
			</CountriesProvider>,
		);

		if (!contextValues) {
			throw new Error('Failed to render provider.');
		}

		return contextValues;
	};

	it('should render provider', () => {
		const result = render(
			<CountriesProvider data={{}}>Hello world!</CountriesProvider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should render provider with data', () => {
		const result = render(
			<CountriesProvider
				data={{
					['GB']: {
						name: 'United Kingdom',
						iso3166: 'GB',
						region: 'Europe',
					},
				}}
			>
				Hello world!
			</CountriesProvider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should provide countries with selected property', () => {
		const context = renderProvider();

		expect(context.countries[0]?.selected).toBe(false);
		expect(context.countries[1]?.selected).toBe(false);
	});
});
