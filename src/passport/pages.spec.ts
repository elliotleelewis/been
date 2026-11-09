import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import {
	jumpToPassportPageAtom,
	passportChaptersAtom,
	passportOpeningOfAtom,
	passportPageAtom,
	turnPassportPageAtom,
} from "./pages.ts";
import { flippedVisaAtom } from "./visa-backs.ts";

/**
 * A store for a passport of six pages, to be laid open two at a time: the cover, the identity
 * page, two pages of visas, for the first stamp and Europe and Western Europe complete, and two
 * pages of stamps for the seven countries ticked.
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
	return store;
};

/** What kind of page is on show, left to right, with the passport open, a blank page as `null`. */
const kindsShownIn = (store: ReturnType<typeof createStore>): readonly (string | null)[] =>
	store
		.get(passportOpeningOfAtom)(true)
		.shown.map((page) => page?.kind ?? null);

describe("passport pages", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store, and the files after
	// this one would otherwise start with its countries already ticked.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should open from the cover onto a spread, and turn a spread at a time", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();

		expect(kindsShownIn(store)).toStrictEqual(["cover"]);

		store.set(turnPassportPageAtom, { by: 1, spread: true });

		expect(kindsShownIn(store)).toStrictEqual(["identity", "visas"]);

		store.set(turnPassportPageAtom, { by: 1, spread: true });

		expect(kindsShownIn(store)).toStrictEqual(["visas", "stamps"]);
		expect(store.get(passportOpeningOfAtom)(true).turns).toStrictEqual({
			back: true,
			forward: true,
		});
	}, 5000);

	it("should turn back to the cover, and open at the spread a page lies in", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();
		store.set(passportPageAtom, 2);

		expect(kindsShownIn(store)).toStrictEqual(["identity", "visas"]);

		store.set(turnPassportPageAtom, { by: -1, spread: true });

		expect(kindsShownIn(store)).toStrictEqual(["cover"]);
		expect(store.get(passportOpeningOfAtom)(true).turns).toStrictEqual({
			back: false,
			forward: true,
		});
	}, 5000);

	it("should leave the last page facing a blank one", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();
		store.set(visitsAtom, { FR: {} });
		store.set(turnPassportPageAtom, { by: 1, spread: true });
		store.set(turnPassportPageAtom, { by: 1, spread: true });

		// The first stamp's visa faces the first page of those within reach, which run onto a second.
		expect(kindsShownIn(store)).toStrictEqual(["locked", "locked"]);

		store.set(turnPassportPageAtom, { by: 1, spread: true });

		expect(kindsShownIn(store)).toStrictEqual(["stamps", null]);
	}, 5000);

	it("should open straight at any of its parts, at the spread it starts in", () => {
		expect.hasAssertions();

		const store = storeOfSpreads();
		store.set(visitsAtom, { FR: {} });

		expect(store.get(passportChaptersAtom)).toStrictEqual([
			{ chapter: "visas", page: 2 },
			{ chapter: "locked", page: 3 },
			{ chapter: "stamps", page: 5 },
		]);

		store.set(flippedVisaAtom, "region:150");
		store.set(jumpToPassportPageAtom, 5);

		expect(kindsShownIn(store)).toStrictEqual(["stamps", null]);
		expect(store.get(flippedVisaAtom)).toBeNull();

		store.set(turnPassportPageAtom, { by: -1, spread: true });

		expect(kindsShownIn(store)).toStrictEqual(["locked", "locked"]);
	}, 5000);
});
