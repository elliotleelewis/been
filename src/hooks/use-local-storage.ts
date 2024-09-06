import { useEffect, useState } from 'react';

import { useWindow } from './use-window';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
	const window = useWindow();

	const [storedValue, setStoredValue] = useState<T>((): T => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch (error) {
			console.warn(`Error setting localStorage key "${key}":`, error);
		}
	}, [window, key, storedValue]);

	return [storedValue, setStoredValue] as const;
};
