import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { countryCodesAtom, rawCountriesAtom } from "../core/dataset.ts";
import { sharedVisitsAtom } from "../core/location.ts";
import { focusAtom, visitsAtom } from "../core/selection.ts";
import { encodeShare } from "../core/share-link.ts";
import { TODAY, freezeToday } from "../core/test.ts";
import { endStampMomentAtom, stampMomentAtom } from "../core/ticking.ts";
import { lastTapAtom, tapCountryAtom, undoTapAtom } from "./taps.ts";

describe("taps", () => {
	// `visitsAtom` is backed by local storage, which outlives an individual store.
	afterEach(() => {
		vi.useRealTimers();
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
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

	it("should stamp a country tapped on, but not one tapped off", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(tapCountryAtom, "FR");
		const ticked = store.get(stampMomentAtom);
		store.set(endStampMomentAtom, 1);
		store.set(tapCountryAtom, "FR");

		expect(ticked).toStrictEqual({ code: "FR", id: 1 });
		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);

	it("should leave the reader's own map alone while a shared one is on show", () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(rawCountriesAtom, { FR: { iso3166: "FR", region: "150", subregion: "155" } });
		store.sub(sharedVisitsAtom, vi.fn<() => void>());
		const link = encodeShare({ FR: {} }, store.get(countryCodesAtom));
		globalThis.history.replaceState(null, "", `#share=${link}`);
		globalThis.dispatchEvent(new globalThis.HashChangeEvent("hashchange"));
		store.set(tapCountryAtom, "FR");

		expect(store.get(visitsAtom)).toStrictEqual({});
		expect(store.get(lastTapAtom)).toBeNull();
	}, 5000);
});
