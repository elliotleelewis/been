import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { PrivacyPage } from "./privacy-page.tsx";

describe("privacy page", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render", () => {
		expect.hasAssertions();

		const { container, getByRole } = render(
			<InRouter>
				<PrivacyPage />
			</InRouter>,
		);

		expect(getByRole("heading", { level: 1, name: "Privacy policy" })).toBeInTheDocument();
		expect(getByRole("link", { name: "What’s kept on your device" })).toHaveAttribute(
			"href",
			"/cookies",
		);
		expect(getByRole("link", { name: "Back to your map" })).toHaveAttribute("href", "/");
		expect(container).toMatchSnapshot();
	}, 5000);
});
