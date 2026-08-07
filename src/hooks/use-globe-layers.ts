import { useMemo } from "react";
import type { FillExtrusionLayerSpecification, FillLayerSpecification } from "mapbox-gl";

type Filter = NonNullable<FillExtrusionLayerSpecification["filter"]>;

export interface GlobeLayers {
	beenFilter: Filter;
	beenPaint: NonNullable<FillLayerSpecification["paint"]>;
	buildingsFilter: Filter;
	buildingsPaint: NonNullable<FillExtrusionLayerSpecification["paint"]>;
}

export const useGlobeLayers = (selectedCountries: readonly string[]): GlobeLayers => {
	const beenFilter: Filter = useMemo(
		() => ["in", ["get", "iso_3166_1"], ["literal", selectedCountries]],
		[selectedCountries],
	);
	const beenPaint: NonNullable<FillLayerSpecification["paint"]> = useMemo(
		() => ({
			"fill-color": "#fd7e14",
			"fill-opacity": 0.6,
		}),
		[],
	);

	const buildingsFilter: Filter = useMemo(() => ["==", "extrude", "true"], []);
	const buildingsPaint: NonNullable<FillExtrusionLayerSpecification["paint"]> = useMemo(
		() => ({
			"fill-extrusion-base": [
				"interpolate",
				["linear"],
				["zoom"],
				15,
				0,
				15.05,
				["get", "min_height"],
			],
			"fill-extrusion-color": [
				"case",
				["in", ["get", "iso_3166_1"], ["literal", selectedCountries]],
				"#fd7e14",
				"#fd7e14",
			],
			"fill-extrusion-height": [
				"interpolate",
				["linear"],
				["zoom"],
				15,
				0,
				15.05,
				["get", "height"],
			],
			"fill-extrusion-opacity": 0.6,
		}),
		[selectedCountries],
	);

	return useMemo(
		() => ({ beenFilter, beenPaint, buildingsFilter, buildingsPaint }),
		[beenFilter, beenPaint, buildingsFilter, buildingsPaint],
	);
};
