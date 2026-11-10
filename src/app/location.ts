import type { RouterHistory } from "@tanstack/react-router";
import type { getDefaultStore } from "jotai";

import { locationHashAtom } from "../core/location.ts";

/** A jotai store, as the app keeps its atoms in. */
type Store = ReturnType<typeof getDefaultStore>;

/**
 * Mirrors the hash of the location the router's `history` is at into `store`, where atoms can read it: at once, so the
 * first render already shows the map the URL asks for, then after every navigation, the browser's
 * back and forward and a hash typed into the address bar included. Gives back what stops it.
 */
export const mirrorLocation = (history: RouterHistory, store: Store): (() => void) => {
	store.set(locationHashAtom, history.location.hash);
	return history.subscribe(({ location }) => {
		store.set(locationHashAtom, location.hash);
	});
};
