import { cleanup, render } from "@testing-library/react";
import { Provider } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Country } from "../models/country.ts";
import { rawCountriesAtom } from "../state/atoms.ts";
import { HydrateAtoms } from "../utils/test.ts";
import { Menu } from "./menu";

const country: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "Europe",
};

const renderMenu = (): ReturnType<typeof render> =>
	render(
		<Provider>
			<HydrateAtoms initialValues={[[rawCountriesAtom, { [country.iso3166]: country }]]}>
				<Menu fullscreen={false} toggleFullscreen={vi.fn<() => void>()} />
			</HydrateAtoms>
		</Provider>,
	);

describe("menu", () => {
	beforeEach(() => {
		globalThis.localStorage.clear();
	});

	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = renderMenu();

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should tick the checkbox when it is clicked", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const checkbox = result.getByLabelText("Visited");

		expect(checkbox).not.toBeChecked();

		checkbox.click();

		expect(checkbox).toBeChecked();
	}, 5000);

	it("should untick the checkbox when it is clicked again", () => {
		expect.hasAssertions();

		const result = renderMenu();
		const checkbox = result.getByLabelText("Visited");

		checkbox.click();
		checkbox.click();

		expect(checkbox).not.toBeChecked();
	}, 5000);
});
