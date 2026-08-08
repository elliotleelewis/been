import { render } from "@testing-library/react";
import { bbox, featureCollection } from "@turf/turf";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { countries } from "../data/countries";
import type { Country } from "../models/country";
import { MapboxSourceKeys } from "../models/enums";
import { assertDefined, mockMediaQueryList } from "../utils/test";
import { Globe } from "./globe";
import type { MapForwardedRef } from "./globe";

// Mapbox derives latitudes from tile coordinates with `Math.atan(Math.exp(…))`, and engines are
// free to differ in the last place on those calls, so bounds shift by ~1e-14 whenever the bundled
// Chromium changes. Six decimal places (~5cm) absorbs that while still catching real data changes.
const BOUNDS_PRECISION = 6;

const expectCountryBounds = (globe: MapForwardedRef, country: Country): void => {
	const { iso3166, name, bounds } = country;
	const features = assertDefined(
		globe.querySourceFeatures(MapboxSourceKeys.Countries, {
			filter: ["==", ["get", "iso_3166_1"], iso3166],
			sourceLayer: "country_boundaries",
		}),
		`No source features were queryable for ${name}.`,
	);
	expect.soft(features.length, name).toBeGreaterThanOrEqual(1);

	const [west, south, east, north] = bbox(featureCollection(features));
	expect.soft(bounds?.[0], `${name} (west)`).toBeCloseTo(west, BOUNDS_PRECISION);
	expect.soft(bounds?.[1], `${name} (south)`).toBeCloseTo(south, BOUNDS_PRECISION);
	expect.soft(bounds?.[2], `${name} (east)`).toBeCloseTo(east, BOUNDS_PRECISION);
	expect.soft(bounds?.[3], `${name} (north)`).toBeCloseTo(north, BOUNDS_PRECISION);
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

	it("should have geojson data for every country in dataset", async () => {
		expect.hasAssertions();

		const map = createRef<MapForwardedRef>();
		render(<Globe ref={map} />);

		await vi.waitUntil(() => map.current?.isSourceLoaded(MapboxSourceKeys.Countries), {
			timeout: 5000,
		});

		const globe = assertDefined(map.current, "Globe did not attach its forwarded ref.");
		for (const country of countries) {
			expectCountryBounds(globe, country);
		}
	}, 30_000);
});
