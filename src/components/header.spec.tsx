import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Header } from './header';

describe('Header', () => {
	test('it should render', () => {
		const result = render(<Header />);

		expect(result).toMatchSnapshot();
	});
});
