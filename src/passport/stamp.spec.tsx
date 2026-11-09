import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { stampDesignOf } from "./stamp-design.ts";
import { Stamp } from "./stamp.tsx";
import type { PassportStamp } from "./types.ts";

/** The Holy See's stamp, which the atlas draws no outline for, as only a point. */
const HOLY_SEE: PassportStamp = {
	country: { iso3166: "VA", name: "Vatican City", region: "150", subregion: "039" },
	date: "09 NOV 2026",
	design: stampDesignOf("VA", "150"),
	silhouette: "",
};

describe("stamp", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should put an emblem of its code in the middle of a country with no outline", () => {
		expect.hasAssertions();

		const { container } = render(<Stamp stamp={HOLY_SEE} />);

		expect(container.querySelectorAll("circle")).toHaveLength(2);
		expect(container.querySelector("text[text-anchor='middle']")).toHaveTextContent("VA");
	}, 5000);

	it("should draw a country's outline where it has one, and no emblem", () => {
		expect.hasAssertions();

		const { container } = render(<Stamp stamp={{ ...HOLY_SEE, silhouette: "M0 0L10 0L10 10Z" }} />);

		expect(container.querySelector("path[d='M0 0L10 0L10 10Z']")).not.toBeNull();
		expect(container.querySelector("circle")).toBeNull();
	}, 5000);
});
