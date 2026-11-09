import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { pointedCountryAtom } from "../core/selection.ts";
import { assertDefined } from "../core/test.ts";
import { MenuItem } from "./menu-item.tsx";

/** Renders the United Kingdom's row with a store of its own, to see what it points the globe at. */
const renderPointable = (): {
	readonly checkbox: HTMLElement;
	readonly label: HTMLElement;
	readonly store: ReturnType<typeof createStore>;
} => {
	const store = createStore();
	const result = render(
		<Provider store={store}>
			<MenuItem
				country={{ iso3166: "GB", name: "United Kingdom", region: "150", subregion: "154" }}
			/>
		</Provider>,
	);
	const checkbox = result.getByRole("checkbox", { name: "United Kingdom" });
	return {
		checkbox,
		label: assertDefined(checkbox.closest("label"), "The checkbox has no label."),
		store,
	};
};

describe("menuItem", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = render(
			<MenuItem
				country={{
					iso3166: "GB",
					name: "United Kingdom",
					region: "150",
					subregion: "154",
				}}
			/>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	// The label around the checkbox names it, so a screen reader says which country it ticks.
	it("should name its checkbox after the country", () => {
		expect.hasAssertions();

		const result = render(
			<MenuItem
				country={{
					iso3166: "GB",
					name: "United Kingdom",
					region: "150",
					subregion: "154",
				}}
			/>,
		);

		expect(result.getByRole("checkbox", { name: "United Kingdom" })).toBeInTheDocument();
	}, 5000);

	it("should point the globe at its country while the mouse is on it", () => {
		expect.hasAssertions();

		const { label, store } = renderPointable();
		fireEvent.pointerEnter(label);

		expect(store.get(pointedCountryAtom)).toBe("GB");

		fireEvent.pointerLeave(label);

		expect(store.get(pointedCountryAtom)).toBeNull();
	}, 5000);

	it("should point the globe at its country while focus is on it", () => {
		expect.hasAssertions();

		const { checkbox, store } = renderPointable();
		act(() => {
			checkbox.focus();
		});

		expect(store.get(pointedCountryAtom)).toBe("GB");
	}, 5000);

	it("should leave the globe on another country the reader has already moved on to", () => {
		expect.hasAssertions();

		const { checkbox, store } = renderPointable();
		act(() => {
			checkbox.focus();
			store.set(pointedCountryAtom, "FR");
			checkbox.blur();
		});

		expect(store.get(pointedCountryAtom)).toBe("FR");
	}, 5000);
});
