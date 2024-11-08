import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './progress';

describe('Progress', () => {
	it('should render', () => {
		const result = render(<Progress complete={0} />);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
