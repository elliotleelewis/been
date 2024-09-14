import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('Header', () => {
	it('should render', () => {
		const result = render(<Header />);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
