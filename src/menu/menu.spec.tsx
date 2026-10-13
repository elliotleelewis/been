import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Provider } from "jotai";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { HydrateAtoms, assertDefined } from "../core/test.ts";
import type { Country } from "../core/types.ts";
import { Menu } from "./menu.tsx";

const country: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "150",
	subregion: "154",
};
const brazil: Country = {
	iso3166: "BR",
	name: "Brazil",
	region: "019",
	subregion: "005",
};

const renderMenu = (): ReturnType<typeof render> =>
	render(
		<Provider>
			<HydrateAtoms
				initialValues={[
					[rawCountriesAtom, { [brazil.iso3166]: brazil, [country.iso3166]: country }],
					[homeRegionAtom, "150"],
				]}
			>
				<Menu />
			</HydrateAtoms>
		</Provider>,
	);

const checkboxFor = (result: ReturnType<typeof render>, name: string): HTMLElement =>
	assertDefined(
		result.getByText(name).closest("label")?.querySelector("input"),
		`No checkbox for ${name}.`,
	);

describe("menu", () => {
	beforeEach(() => {
		globalThis.localStorage.clear();
	});

	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		// A tick outlives the test in local storage, where the next spec to load would read it.
		globalThis.localStorage.clear();
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = renderMenu();

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should tick the checkbox when it is clicked", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const checkbox = checkboxFor(result, country.name);

		expect(checkbox).not.toBeChecked();

		checkbox.click();

		expect(checkbox).toBeChecked();
	}, 5000);

	it("should untick the checkbox when it is clicked again", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const checkbox = checkboxFor(result, country.name);

		checkbox.click();
		checkbox.click();

		expect(checkbox).not.toBeChecked();
	}, 5000);

	it("should open only the home continent", () => {
		expect.hasAssertions();

		const result = renderMenu();

		expect(checkboxFor(result, country.name)).toBeVisible();
		expect(checkboxFor(result, brazil.name)).not.toBeVisible();
	}, 5000);

	it("should open a continent when its heading is clicked", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const heading = result.getByRole("button", { name: /Americas/u });

		act(() => {
			heading.click();
		});

		expect(heading).toHaveAttribute("aria-expanded", "true");
		expect(checkboxFor(result, brazil.name)).toBeVisible();
	}, 5000);

	it("should show a match in a closed continent while searching", () => {
		expect.hasAssertions();

		const result = renderMenu();

		fireEvent.change(result.getByRole("searchbox"), { target: { value: "bra" } });

		expect(checkboxFor(result, brazil.name)).toBeVisible();
		expect(result.queryByText(country.name)).toBeNull();
	}, 5000);

	it("should tick the only match when the search is submitted", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const searchbox = result.getByRole("searchbox");
		fireEvent.change(searchbox, { target: { value: "bra" } });
		fireEvent.submit(assertDefined(searchbox.closest("form"), "The search box is not in a form."));

		expect(searchbox).toHaveValue("");
		expect(checkboxFor(result, brazil.name)).toBeChecked();
	}, 5000);
});
