import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { AppLoading } from "./app-loading.tsx";

describe("app loading", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render the page's frame, with the search box disabled until the list loads and the small print linked", () => {
		expect.hasAssertions();

		const result = render(
			<InRouter>
				<AppLoading />
			</InRouter>,
		);

		expect(result.getByRole("heading", { name: "been" })).toBeVisible();
		expect(result.getByRole("searchbox", { name: "Search" })).toBeDisabled();
		expect(result.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
		expect(result.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies");
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
