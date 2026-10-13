import { createJSONStorage } from "jotai/utils";

/** Jotai does not export its storage type, but this overload of `createJSONStorage` returns it. */
type SyncStorage<Value> = ReturnType<typeof createJSONStorage<Value>>;

/**
 * JSON in `localStorage`, but only ever in the shape `isValid` accepts. A stored value of any other
 * shape, such as one written by an older version of the app, is cleared rather than migrated, and
 * the atom starts again from its initial value.
 */
export const validatedStorage = <Value>(
	isValid: (value: unknown) => value is Value,
): SyncStorage<Value> => {
	const storage = createJSONStorage<unknown>();
	return {
		getItem: (key, initialValue) => {
			// Handed back in place of a value that is missing or is not JSON at all, which the JSON
			// storage does not otherwise tell apart from a stored value equal to the initial one.
			const unreadable = Symbol("unreadable");
			const value = storage.getItem(key, unreadable);
			if (isValid(value)) {
				return value;
			}
			storage.removeItem(key);
			return initialValue;
		},
		removeItem: (key) => {
			storage.removeItem(key);
		},
		setItem: (key, value) => {
			storage.setItem(key, value);
		},
		subscribe: (key, callback, initialValue) =>
			storage.subscribe?.(
				key,
				(value) => {
					callback(isValid(value) ? value : initialValue);
				},
				initialValue,
			),
	};
};
