import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Country } from "../models/country";
import { rawCountriesAtom, visitsAtom } from "../state/atoms";
import { tapCountryAtom } from "../state/taps";
import { TapToast } from "./tap-toast";

const unitedKingdom: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "150",
	subregion: "154",
};

const renderToast = (): {
	readonly result: ReturnType<typeof render>;
	readonly store: ReturnType<typeof createStore>;
} => {
	const store = createStore();
	store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom });
	const result = render(
		<Provider store={store}>
			<TapToast />
		</Provider>,
	);
	return { result, store };
};

describe("tap toast", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		globalThis.localStorage.clear();
	});

	it("should say nothing until a country is tapped", () => {
		expect.hasAssertions();

		const { result } = renderToast();

		expect(result.getByRole("status")).toBeEmptyDOMElement();
	}, 5000);

	it("should name the country a tap ticked", () => {
		expect.hasAssertions();

		const { result, store } = renderToast();
		act(() => {
			store.set(tapCountryAtom, unitedKingdom.iso3166);
		});

		expect(result.getByRole("status")).toHaveTextContent("Added United Kingdom");
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should undo the tap when asked", () => {
		expect.hasAssertions();

		const { result, store } = renderToast();
		act(() => {
			store.set(tapCountryAtom, unitedKingdom.iso3166);
		});
		act(() => {
			result.getByRole("button", { name: "Undo" }).click();
		});

		expect(store.get(visitsAtom)).toStrictEqual({});
		expect(result.getByRole("status")).toBeEmptyDOMElement();
	}, 5000);

	it("should go away on its own", () => {
		expect.hasAssertions();

		vi.useFakeTimers();
		const { result, store } = renderToast();
		act(() => {
			store.set(tapCountryAtom, unitedKingdom.iso3166);
		});
		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(result.getByRole("status")).toBeEmptyDOMElement();
		expect(store.get(visitsAtom)).toStrictEqual({ GB: {} });
	}, 5000);
});
