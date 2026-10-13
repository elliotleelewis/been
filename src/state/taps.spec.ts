import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TODAY, freezeToday } from "../utils/test";
import { focusAtom, visitsAtom } from "./atoms";
import { lastTapAtom, tapCountryAtom, undoTapAtom } from "./taps";

describe("taps", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		vi.useRealTimers();
		globalThis.localStorage.clear();
	});

	it("should tick a tapped country without moving the camera", () => {
		expect.hasAssertions();
		freezeToday();

		const store = createStore();
		store.set(tapCountryAtom, "FR");

		expect(store.get(visitsAtom)).toStrictEqual({ FR: { at: TODAY } });
		expect(store.get(focusAtom)).toBeNull();
		expect(store.get(lastTapAtom)).toStrictEqual({ code: "FR", previous: undefined });
	}, 5000);

	it("should untick a tapped country that was ticked", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(visitsAtom, { FR: {}, GB: {} });
		store.set(tapCountryAtom, "FR");

		expect(store.get(visitsAtom)).toStrictEqual({ GB: {} });
		expect(store.get(lastTapAtom)).toStrictEqual({ code: "FR", previous: {} });
	}, 5000);

	it("should undo a tap that ticked a country", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(tapCountryAtom, "FR");
		store.set(undoTapAtom);

		expect(store.get(visitsAtom)).toStrictEqual({});
		expect(store.get(lastTapAtom)).toBeNull();
	}, 5000);

	it("should undo a tap that unticked a country", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(visitsAtom, { FR: {} });
		store.set(tapCountryAtom, "FR");
		store.set(undoTapAtom);

		expect(store.get(visitsAtom)).toStrictEqual({ FR: {} });
	}, 5000);

	it("should do nothing when there is no tap to undo", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(visitsAtom, { FR: {} });
		store.set(undoTapAtom);

		expect(store.get(visitsAtom)).toStrictEqual({ FR: {} });
	}, 5000);
});
