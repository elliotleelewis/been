import { atom } from "jotai";

import type { Visits } from "../models/country.ts";
import { decodeShare, shareValueOf } from "../utils/share.ts";

/** The page's location hash, kept current as the reader follows links or goes back and forward. */
const hashAtom = atom(globalThis.location.hash);
hashAtom.onMount = (setHash) => {
	const update = (): void => {
		setHash(globalThis.location.hash);
	};
	globalThis.addEventListener("hashchange", update);
	return (): void => {
		globalThis.removeEventListener("hashchange", update);
	};
};

/**
 * The map a share link opened the page on, or `null` when it opened on the reader's own. A link
 * this version cannot read opens their own map, rather than an empty one that looks like theirs.
 */
export const sharedVisitsAtom = atom<Visits | null>((get) => {
	const value = shareValueOf(get(hashAtom));
	return (value === undefined ? undefined : decodeShare(value)) ?? null;
});

/** Whether a shared map is on show, which leaves nothing on screen that can change. */
export const viewingSharedMapAtom = atom((get) => get(sharedVisitsAtom) !== null);

/** Leaves a shared map for the reader's own, taking the link off the address so a reload stays. */
export const leaveSharedMapAtom = atom(undefined, (_get, set) => {
	const { pathname, search } = globalThis.location;
	globalThis.history.replaceState(globalThis.history.state, "", `${pathname}${search}`);
	set(hashAtom, "");
});
