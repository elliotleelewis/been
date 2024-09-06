import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
	it('should initialise', () => {
		const { result } = renderHook(() => useLocalStorage('TEST', 'hello'));
		const [data, setData] = result.current;

		expect(data).toBe('hello');
		expect(setData).toBeDefined();
	});
});
