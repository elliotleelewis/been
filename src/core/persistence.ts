import { atom } from "jotai";

/** The browser's answer to this session's request to keep the site's storage, once it has asked. */
const persistRequestAtom = atom<Promise<boolean> | null>(null);

/**
 * Asks the browser whether it keeps the site's storage, settling on false wherever it cannot say.
 * `navigator.storage` is missing outside a secure context, such as the dev server reached over the
 * network, which throws here and reads as a no.
 */
const askStorage = async (question: "persist" | "persisted"): Promise<boolean> => {
	try {
		const persisted = await globalThis.navigator.storage[question]();
		return persisted;
	} catch {
		return false;
	}
};

/**
 * Whether the browser keeps the site's storage: its answer once it has been asked this session,
 * and until then whether it already did, from an earlier one.
 */
export const storagePersistedAtom = atom(async (get) => {
	const persisted = await (get(persistRequestAtom) ?? askStorage("persisted"));
	return persisted;
});

/**
 * Asks the browser to keep the site's storage, so the reader's map is not cleared to make room
 * for other sites'. Most browsers decide without asking the reader, from how much they use the
 * site; Firefox asks them. It only asks once a session, however often it is called, so a reader who
 * has said no is not asked again on their next tick.
 */
export const persistStorageAtom = atom(null, (get, set) => {
	if (get(persistRequestAtom) === null) {
		set(persistRequestAtom, askStorage("persist"));
	}
});
