import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { homeRegionAtom } from "../core/home-region.ts";
import { expandedRegionsAtom, toggleRegionAtom } from "./regions.ts";

describe("regions", () => {
	// The open continents are backed by local storage, which outlives an individual store.
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should open only the home continent at first", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(homeRegionAtom, "150");

		expect(store.get(expandedRegionsAtom)).toStrictEqual(["150"]);
	}, 5000);

	it("should open every continent when there is no guess at home", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(homeRegionAtom, undefined);

		expect(store.get(expandedRegionsAtom)).toStrictEqual(["002", "009", "019", "142", "150"]);
	}, 5000);

	it("should remember the continents the reader opens and closes", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(homeRegionAtom, "150");

		store.set(toggleRegionAtom, "150");
		store.set(toggleRegionAtom, "019");

		expect(store.get(expandedRegionsAtom)).toStrictEqual(["019"]);
		expect(globalThis.localStorage.getItem("APP_EXPANDED_REGIONS")).toBe(JSON.stringify(["019"]));
	}, 5000);
});
