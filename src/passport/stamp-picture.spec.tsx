import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stampDesignOf } from "./stamp-design.ts";
import { StampPicture } from "./stamp-picture.tsx";
import type { PassportStamp } from "./types.ts";

const FRANCE: PassportStamp = {
	country: { iso3166: "FR", name: "France", region: "150", subregion: "155" },
	date: "13 OCT 2026",
	design: stampDesignOf("FR", "150"),
	silhouette: undefined,
};

describe("stamp picture", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should swap a stamp for a picture of itself once drawn, lettering and all", async () => {
		expect.hasAssertions();

		const { container } = render(<StampPicture stamp={FRANCE} />);
		const picture = await vi.waitUntil(() => container.querySelector("img"), { timeout: 4000 });
		const markup = decodeURIComponent(picture.src);

		expect(markup).toContain("FRANCE");
		expect(markup).toContain("font-family=");
		expect(container.querySelector("svg")).toHaveStyle({ display: "none" });
	}, 5000);
});
