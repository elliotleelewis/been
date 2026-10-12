import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MenuItem } from "./menu-item";

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
});
