import { atom } from "jotai";

import { STORAGE_KEYS } from "../core/storage.ts";

/**
 * Where clearing what the app stores has got to: not begun, asked once and waiting for the tap
 * that confirms it, as it deletes the reader's map, or done.
 */
export const clearingAtom = atom<"armed" | "cleared" | "idle">("idle");

/**
 * Clears what the app keeps in local storage, on the second asking: the first only arms it. Storage
 * sends no event to the tab that changed it, so this sends one, for whatever watches it here.
 */
export const clearStoredThingsAtom = atom(undefined, (get, set) => {
	if (get(clearingAtom) !== "armed") {
		set(clearingAtom, "armed");
		return;
	}
	for (const key of Object.values(STORAGE_KEYS)) {
		globalThis.localStorage.removeItem(key);
	}
	globalThis.dispatchEvent(new globalThis.StorageEvent("storage"));
	set(clearingAtom, "cleared");
});
