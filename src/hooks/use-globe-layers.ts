import type { FillLayerSpecification } from "maplibre-gl";
import { useMemo } from "react";

export interface GlobeLayers {
	beenFilter: NonNullable<FillLayerSpecification["filter"]>;
	beenPaint: NonNullable<FillLayerSpecification["paint"]>;
}

export const useGlobeLayers = (selectedCountries: readonly string[]): GlobeLayers => {
	const beenFilter: NonNullable<FillLayerSpecification["filter"]> = useMemo(
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

	return useMemo(() => ({ beenFilter, beenPaint }), [beenFilter, beenPaint]);
};
