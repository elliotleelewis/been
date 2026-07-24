import { render } from "@testing-library/react";
import { bbox, featureCollection } from "@turf/turf";
import { createRef } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { countries } from "../data/countries";
import { MapboxSourceKeys } from "../models/enums";
import { assertDefined, mockMediaQueryList } from "../utils/test";
import { Globe } from "./globe";
import type { MapForwardedRef } from "./globe";

describe("globe", () => {
	beforeAll(() => {
		vi.spyOn(window, "matchMedia").mockImplementation(() => mockMediaQueryList());
	});

	it("should render", () => {
		const result = render(<Globe />);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should accept a ref", () => {
		const map = createRef<MapForwardedRef>();
		const result = render(<Globe ref={map} />);

		expect(map.current).toBeTruthy();
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should have geojson data for every country in dataset", async () => {
		const map = createRef<MapForwardedRef>();
		render(<Globe ref={map} />);

		await vi.waitUntil(() => map.current?.isSourceLoaded(MapboxSourceKeys.Countries), {
			timeout: 5000,
		});

		const globe = assertDefined(map.current, "Globe did not attach its forwarded ref.");
		for (const { iso3166, name, bounds } of countries) {
			const features = assertDefined(
				globe.querySourceFeatures(MapboxSourceKeys.Countries, {
					filter: ["==", ["get", "iso_3166_1"], iso3166],
					sourceLayer: "country_boundaries",
				}),
				`No source features were queryable for ${name}.`,
			);
			expect.soft(features.length, name).toBeGreaterThanOrEqual(1);
			expect.soft(bounds, name).toEqual(bbox(featureCollection(features)));
		}
	}, 30_000);
});
