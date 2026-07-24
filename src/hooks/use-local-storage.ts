import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useWindow } from "./use-window";

export const useLocalStorage = <T>(
	key: string,
	initialValue: T,
): readonly [T, Dispatch<SetStateAction<T>>] => {
	const window = useWindow();

	const [storedValue, setStoredValue] = useState<T>((): T => {
		try {
			const item = window.localStorage.getItem(key);
			if (item === null) {
				return initialValue;
			}
			// oxlint-disable-next-line no-unsafe-type-assertion -- Deserialised JSON cannot be narrowed to the caller's generic without a schema.
			return JSON.parse(item) as T;
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
