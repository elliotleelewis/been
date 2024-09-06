import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CountriesProvider } from './countries-provider';

describe('CountriesContext', () => {
	it('should render provider', () => {
		const result = render(
			<CountriesProvider data={[]}>Hello world!</CountriesProvider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should render provider with data', () => {
		const result = render(
			<CountriesProvider
				data={[
					{
						name: 'United Kingdom',
						iso3166: 'GB',
						region: 'Europe',
					},
				]}
			>
				Hello world!
			</CountriesProvider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
