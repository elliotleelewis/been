import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Country } from "../models/country";
import { visitsAtom } from "../state/atoms";
import { rawCountriesAtom } from "../state/dataset";
import { lastTapAtom, tapCountryAtom } from "../state/taps";
import { TODAY, freezeToday } from "../utils/test";
import { TapToastRegion } from "./tap-toast-region";

const unitedKingdom: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "150",
	subregion: "154",
};

interface Rendered {
	readonly result: ReturnType<typeof render>;
	readonly store: ReturnType<typeof createStore>;
}

const renderRegion = (): Rendered => {
	const store = createStore();
	store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom });
	const result = render(
		<Provider store={store}>
			<TapToastRegion />
		</Provider>,
	);
	return { result, store };
};

const tap = ({ store }: Rendered): void => {
	act(() => {
		store.set(tapCountryAtom, unitedKingdom.iso3166);
	});
};

describe("tap toast region", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		globalThis.localStorage.clear();
	});

	it("should not be there until a country is tapped", () => {
		expect.hasAssertions();

		const { result } = renderRegion();

		expect(result.queryByRole("region")).toBeNull();
	}, 5000);

	it("should name the country a tap ticked, in a landmark that counts its notifications", () => {
		expect.hasAssertions();

		const rendered = renderRegion();
		tap(rendered);

		expect(rendered.result.getByRole("region", { name: "1 notification." })).toBeInTheDocument();
		expect(rendered.result.getByRole("alertdialog")).toHaveTextContent("Added United Kingdom");
		expect(rendered.result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should undo the tap when asked", () => {
		expect.hasAssertions();

		const rendered = renderRegion();
		tap(rendered);
		act(() => {
			rendered.result.getByRole("button", { name: "Undo" }).click();
		});

		expect(rendered.store.get(visitsAtom)).toStrictEqual({});
		expect(rendered.result.queryByRole("alertdialog")).toBeNull();
	}, 5000);

	it("should close without undoing when dismissed", () => {
		expect.hasAssertions();
		freezeToday();

		const rendered = renderRegion();
		tap(rendered);
		act(() => {
			rendered.result.getByRole("button", { name: "Close" }).click();
		});

		expect(rendered.store.get(visitsAtom)).toStrictEqual({ GB: { at: TODAY } });
		expect(rendered.store.get(lastTapAtom)).toBeNull();
		expect(rendered.result.queryByRole("alertdialog")).toBeNull();
	}, 5000);

	it("should go away on its own", () => {
		expect.hasAssertions();

		vi.useFakeTimers();
		const rendered = renderRegion();
		tap(rendered);
		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(rendered.result.queryByRole("alertdialog")).toBeNull();
		expect(rendered.store.get(lastTapAtom)).toBeNull();
	}, 5000);

	it("should stay while it has focus, so there is time to reach the undo", () => {
		expect.hasAssertions();

		vi.useFakeTimers();
		const rendered = renderRegion();
		tap(rendered);
		act(() => {
			rendered.result.getByRole("button", { name: "Undo" }).focus();
		});
		act(() => {
			vi.advanceTimersByTime(10_000);
		});

		expect(rendered.result.getByRole("alertdialog")).toBeInTheDocument();
	}, 5000);
});
