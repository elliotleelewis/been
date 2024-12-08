import { render } from '@testing-library/react';
import { Provider } from 'jotai';
import { describe, expect, it } from 'vitest';
import type { Country } from '../models/country.ts';
import { rawCountriesAtom } from '../state/atoms.ts';
import { HydrateAtoms } from '../utils/test.ts';
import { Menu } from './menu';

const country: Country = {
	name: 'United Kingdom',
	iso3166: 'GB',
	region: 'Europe',
};

describe('Menu', () => {
	it('should render', () => {
		const result = render(
			<Provider>
				<HydrateAtoms
					initialValues={[
						[rawCountriesAtom, { [country.iso3166]: country }],
					]}
				>
					<Menu
						fullscreen={false}
						toggleFullscreen={() => undefined}
					/>
				</HydrateAtoms>
			</Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
