import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { CountriesProvider } from './countries-context';

describe('CountriesContext', () => {
	test('it should render provider', () => {
		const result = render(
			<CountriesProvider>Hello world!</CountriesProvider>,
		);

		expect(result).toMatchSnapshot();
	});
});
