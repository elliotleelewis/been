import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "../core/storage.ts";

/** A snapshot of what is stored: the keys present, in order, or `null` where storage is blocked. */
type Snapshot = string | null;

/** What the app has in local storage right now, as a snapshot that compares by value. */
const snapshot = (): Snapshot => {
	try {
		return Object.values(STORAGE_KEYS)
			.filter((key) => globalThis.localStorage.getItem(key) !== null)
			.join(" ");
	} catch {
		// Reading storage throws where the browser blocks it, and there is then nothing to show.
		return null;
	}
};

/** Calls `onChange` whenever storage changes, in another tab or, by the event it sends, this one. */
const subscribe = (onChange: () => void): (() => void) => {
	globalThis.addEventListener("storage", onChange);
	return () => {
		globalThis.removeEventListener("storage", onChange);
	};
};

/** Rendered without a browser, there is no telling, and nothing is offered to clear. */
const serverSnapshot = (): Snapshot => null;

/**
 * Whether the app has anything in local storage: `true` or `false`, or `null` where the browser
 * blocks storage, or there is no browser to ask.
 */
export const useStoredThings = (): boolean | null => {
	const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
	return stored === null ? null : stored !== "";
};
