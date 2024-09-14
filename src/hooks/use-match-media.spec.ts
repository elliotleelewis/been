import { renderHook } from '@testing-library/react';
import {
	type MockInstance,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { useMatchMedia } from './use-match-media';

describe('useMatchMedia', () => {
	let mockMatchMedia: MockInstance<typeof window.matchMedia>;
	beforeEach(() => {
		mockMatchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} satisfies Partial<MediaQueryList> as unknown as MediaQueryList);
	});

	it('should initialise', () => {
		const { result } = renderHook(() =>
			useMatchMedia('(max-width: 1024px)'),
		);

		expect(result.current).toBe(false);
		expect(mockMatchMedia).toHaveBeenCalledTimes(2);
	});
});
