import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { encodeShare } from "../utils/share";
import { addCountryAtom, selectedCountriesAtom, visitsAtom } from "./atoms";
import { leaveSharedMapAtom, sharedVisitsAtom, viewingSharedMapAtom } from "./location";
import { tapCountryAtom } from "./taps";

/** Opens a share link the way following one would, and returns a store watching the location. */
const openShareLink = (hash: string): ReturnType<typeof createStore> => {
	const store = createStore();
	// The hash is only read again once something is watching it, as a component would be.
	store.sub(sharedVisitsAtom, vi.fn<() => void>());
	globalThis.history.replaceState(null, "", hash);
	globalThis.dispatchEvent(new globalThis.HashChangeEvent("hashchange"));
	return store;
};

describe("location", () => {
	afterEach(() => {
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
		globalThis.localStorage.clear();
	});

	it("should show the map a share link carries in place of the reader's own", () => {
		expect.hasAssertions();

		const store = openShareLink(`#share=${encodeShare({ FR: {}, IT: {} })}`);
		store.set(visitsAtom, { GB: {} });

		expect(store.get(viewingSharedMapAtom)).toBeTruthy();
		expect(store.get(selectedCountriesAtom)).toStrictEqual(["FR", "IT"]);
	}, 5000);

	it("should open the reader's own map for a link it cannot read", () => {
		expect.hasAssertions();

		const store = openShareLink("#share=9.nonsense");

		expect(store.get(viewingSharedMapAtom)).toBeFalsy();
	}, 5000);

	it("should leave the reader's own map alone while a shared one is on show", () => {
		expect.hasAssertions();

		const store = openShareLink(`#share=${encodeShare({ FR: {} })}`);
		store.set(addCountryAtom, "DE");
		store.set(tapCountryAtom, "ES");

		expect(store.get(visitsAtom)).toStrictEqual({});
	}, 5000);

	it("should go back to the reader's own map, and take the link off the address", () => {
		expect.hasAssertions();

		const store = openShareLink(`#share=${encodeShare({ FR: {} })}`);
		store.set(leaveSharedMapAtom);

		expect(store.get(viewingSharedMapAtom)).toBeFalsy();
		expect(globalThis.location.hash).toBe("");
	}, 5000);
});
