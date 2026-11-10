import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppLoading } from "./app-loading.tsx";

describe("app loading", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render the page's frame, with the search box disabled until the list loads", () => {
		expect.hasAssertions();

		const result = render(<AppLoading />);

		expect(result.getByRole("heading", { name: "been" })).toBeVisible();
		expect(result.getByRole("searchbox", { name: "Search" })).toBeDisabled();
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
