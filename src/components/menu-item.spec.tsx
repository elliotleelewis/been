import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuItem } from './menu-item';

describe('MenuItem', () => {
	it('should render', () => {
		const result = render(
			<MenuItem
				country={{
					name: 'United Kingdom',
					iso3166: 'GB',
					region: 'Europe',
				}}
			/>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
