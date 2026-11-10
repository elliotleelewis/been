import { createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { assertDefined, closeSharedMap, openSharedMap } from "../core/test.ts";
import { countries } from "../data/countries.ts";
import type { VisaBack } from "./types.ts";
import { visaBacksAtom } from "./visa-backs.ts";
import { heldVisaIdsAtom } from "./visas.ts";

const RAW_COUNTRIES = Object.fromEntries(countries.map((country) => [country.iso3166, country]));

/** Ten countries, enough for the first milestone after the first stamp. */
const SHARED = Object.fromEntries(
	["AR", "BR", "CA", "DE", "FR", "IT", "JP", "MX", "PT", "US"].map((code) => [code, {}]),
);

/** A store on a shared map of ten countries, against the reader's own of France and Spain. */
const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, RAW_COUNTRIES);
	store.set(visitsAtom, { ES: { at: "2026-10-13" }, FR: { at: "2026-10-14" } });
	openSharedMap(store, SHARED);
	return store;
};

/** The back of the visa for the achievement `id`, which has to be on show. */
const backOf = (store: ReturnType<typeof createStore>, id: string): VisaBack =>
	assertDefined(store.get(visaBacksAtom).get(id), `No back for ${id}.`);

describe("visaBacksAtom on a shared map", () => {
	afterEach(() => {
		closeSharedMap();
		globalThis.localStorage.clear();
	});

	it("should say the reader holds a visa too, on the day they earned it", () => {
		expect.hasAssertions();

		const store = createTestStore();

		// The reader's first tick, Spain's, earned it.
		const { side } = backOf(store, "milestone:1");

		expect(side).toMatchObject({ kind: "held" });
		expect(side).toHaveProperty("date", expect.stringMatching(/13.*2026/u));
		expect(store.get(heldVisaIdsAtom).has("milestone:1")).toBeTruthy();
	}, 5000);

	it("should say how far the reader's own map is from a visa, and which countries would do", () => {
		expect.hasAssertions();

		const store = createTestStore();
		const { side } = backOf(store, "milestone:10");

		// Eight more are needed, so all of those new to the reader but the last by name would do.
		expect(side).toMatchObject({
			countries: ["AR", "BR", "CA", "DE", "IT", "JP", "MX", "PT"].map((iso3166) => ({ iso3166 })),
			kind: "within",
			remaining: 8,
		});
		expect(store.get(heldVisaIdsAtom).has("milestone:10")).toBeFalsy();
	}, 5000);

	it("should mark the countries the reader's own map has too", () => {
		expect.hasAssertions();

		const store = createTestStore();
		const group = assertDefined(backOf(store, "milestone:10").groups[0], "No countries listed.");
		const standings = Object.fromEntries(
			group.earned.map(({ country }) => [country.iso3166, country.standing]),
		);

		expect(standings["FR"]).toBe("both");
		expect(standings["IT"]).toBe("theirs");
	}, 5000);

	it("should say a shared map carries no dates, with nothing to compare it with", () => {
		expect.hasAssertions();

		const store = createTestStore();
		store.set(visitsAtom, {});

		expect(backOf(store, "milestone:1").side).toStrictEqual({ kind: "shared" });
		expect(store.get(heldVisaIdsAtom).size).toBe(0);
	}, 5000);

	it("should show the stamp that clinched a visa on the reader's own map", () => {
		expect.hasAssertions();

		const store = createTestStore();
		closeSharedMap();

		expect(backOf(store, "milestone:1").side.kind).toBe("clincher");
	}, 5000);
});
