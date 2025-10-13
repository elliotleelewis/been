import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuItem } from './menu-item';

describe('menuItem', () => {
	it('should render', () => {
		const result = render(
			<MenuItem
				country={{
					iso3166: 'GB', name: 'United Kingdom', region: 'Europe',
				}}
			/>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
