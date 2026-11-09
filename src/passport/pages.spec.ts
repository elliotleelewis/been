import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import {
	passportPageAtom,
	passportSpreadAtom,
	passportTurnsAtom,
	shownPassportPagesAtom,
	turnPassportPageAtom,
} from "./pages.ts";

/**
 * A store for a passport of six pages, laid open two at a time: the cover, the identity page, two
 * pages of visas, for the first stamp and Europe and Western Europe complete, and two pages of
 * stamps for the seven countries ticked.
 */
const storeOfSpreads = (): ReturnType<typeof createStore> => {
	const codes = ["AT", "BE", "CH", "DE", "ES", "FR", "IT"];
	const store = createStore();
	store.set(
		rawCountriesAtom,
		Object.fromEntries(
			codes.map((code) => [code, { iso3166: code, region: "150", subregion: "155" }]),
		),
	);
	store.set(visitsAtom, Object.fromEntries(codes.map((code) => [code, {}])));
	store.set(passportSpreadAtom, true);
	return store;
};

/** What kind of page is on show, left to right, a blank page as `null`. */
const kindsShownIn = (store: ReturnType<typeof createStore>): readonly (string | null)[] =>
	store.get(shownPassportPagesAtom).map((page) => page?.kind ?? null);

describe("passport pages", () => {
	it("should open from the cover onto a spread, and turn a spread at a time", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();

		expect(kindsShownIn(store)).toStrictEqual(["cover"]);

		store.set(turnPassportPageAtom, 1);

		expect(kindsShownIn(store)).toStrictEqual(["identity", "visas"]);

		store.set(turnPassportPageAtom, 1);

		expect(kindsShownIn(store)).toStrictEqual(["visas", "stamps"]);
		expect(store.get(passportTurnsAtom)).toStrictEqual({ back: true, forward: true });
	}, 5000);

	it("should turn back to the cover, and open at the spread a page lies in", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();
		store.set(passportPageAtom, 2);

		expect(kindsShownIn(store)).toStrictEqual(["identity", "visas"]);

		store.set(turnPassportPageAtom, -1);

		expect(kindsShownIn(store)).toStrictEqual(["cover"]);
		expect(store.get(passportTurnsAtom)).toStrictEqual({ back: false, forward: true });
	}, 5000);

	it("should leave the last page facing a blank one", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();
		store.set(visitsAtom, { FR: {} });
		store.set(turnPassportPageAtom, 1);
		store.set(turnPassportPageAtom, 1);

		expect(kindsShownIn(store)).toStrictEqual(["stamps", null]);
	}, 5000);
});
