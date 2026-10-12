import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuItem } from "./menu-item";

describe("menuItem", () => {
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
});
