import { render } from '@testing-library/react';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { App } from './app';

describe('App', () => {
	beforeAll(() => {
		vi.spyOn(window, 'matchMedia').mockImplementation(
			() =>
				({
					matches: false,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				}) satisfies Partial<MediaQueryList> as unknown as MediaQueryList,
		);
	});

	test('it should render', () => {
		const result = render(<App data={[]} />);

		expect(result).toMatchSnapshot();
	});
});
