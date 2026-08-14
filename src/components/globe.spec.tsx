import { render } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadAtlas } from "../data/atlas";
import { boundsOf, toBoundaries } from "../data/boundaries";
import type { CountryBoundaries } from "../data/boundaries";
import { countries } from "../data/countries";
import { MapboxSourceKeys } from "../models/enums";
import { assertDefined, mockMediaQueryList } from "../utils/test";
import { Globe } from "./globe";
import type { MapForwardedRef } from "./globe";

// Describes each country as the bounds its boundary in the atlas implies, so a country the atlas
// cannot draw reads as a missing boundary next to its name rather than throwing partway down the
// list, and a mismatch names the country it is about.
const describeBounds = (boundaries: CountryBoundaries): readonly string[] => {
	const byCode = new Map(
		boundaries.features.map((boundary) => [boundary.properties.iso_3166_1, boundary]),
	);
	return countries.map(({ iso3166, name }) => {
		const boundary = byCode.get(iso3166);
		return `${name}: ${boundary === undefined ? "no boundary" : boundsOf(boundary).join(", ")}`;
	});
};

describe("globe", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = render(<Globe />);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should accept a ref", () => {
		expect.hasAssertions();

		const map = createRef<MapForwardedRef>();
		const result = render(<Globe ref={map} />);

		expect(map.current).toBeTruthy();
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	// The bounds in the dataset are generated from the atlas by `pnpm run generate:countries`, so
	// this is what catches an atlas that has been bumped without regenerating them.
	it("should have a boundary and matching bounds for every country in dataset", async () => {
		expect.hasAssertions();

		const fromAtlas = describeBounds(toBoundaries(await loadAtlas()));

		expect(fromAtlas).toStrictEqual(
			countries.map(({ bounds, name }) => `${name}: ${bounds?.join(", ")}`),
		);
	}, 30_000);

	it("should load the country boundaries into the map", async () => {
		expect.hasAssertions();

		const map = createRef<MapForwardedRef>();
		render(<Globe ref={map} />);

		// The source is added empty and filled once the atlas has been fetched, so it reports
		// itself loaded well before it holds anything. Waiting on the features is what waits for
		// the atlas, and `querySourceFeatures` answers an empty list until the source exists.
		await vi.waitUntil(() => map.current?.querySourceFeatures(MapboxSourceKeys.Countries)?.length, {
			timeout: 20_000,
		});

		const globe = assertDefined(map.current, "Globe did not attach its forwarded ref.");
		const features = assertDefined(
			globe.querySourceFeatures(MapboxSourceKeys.Countries),
			"The map never exposed its country boundaries source.",
		);
		// The `been` layer filters on `iso_3166_1`, so the map holding features under any other
		// code would leave those countries unfillable.
		const tracked = new Set(countries.map(({ iso3166 }) => iso3166));
		const untracked = features
			.map((feature) => String(feature.properties?.["iso_3166_1"]))
			.filter((code) => !tracked.has(code));

		expect(features.length).toBeGreaterThan(0);
		expect(untracked).toStrictEqual([]);
	}, 30_000);
});
