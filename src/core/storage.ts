import { createJSONStorage } from "jotai/utils";

/**
 * The keys the app keeps things under in `localStorage`, every one of them, so the cookies page can
 * list and clear exactly what the app stores.
 */
export const STORAGE_KEYS = {
	countries: "APP_COUNTRIES",
	expandedRegions: "APP_EXPANDED_REGIONS",
} as const;

/**
 * Keys the app once kept things under and no longer does, such as the drawer's size, from before
 * the drawer opened the same way every time. Nothing reads them, and the cookies page no longer
 * lists them, so they are cleared rather than left behind.
 */
const RETIRED_STORAGE_KEYS: readonly string[] = ["APP_MENU_SIZE"];

/** Clears whatever the app once kept under keys it no longer uses. */
export const forgetRetiredStorage = (): void => {
	for (const key of RETIRED_STORAGE_KEYS) {
		globalThis.localStorage.removeItem(key);
	}
};

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
