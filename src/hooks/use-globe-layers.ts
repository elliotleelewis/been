import { useAtomValue } from "jotai";
import type { FillLayerSpecification } from "maplibre-gl";
import { useMemo } from "react";

import { selectedCountriesAtom } from "../state/atoms.ts";

type Filter = NonNullable<FillLayerSpecification["filter"]>;
type Paint = NonNullable<FillLayerSpecification["paint"]>;

export interface GlobeLayers {
	beenFilter: Filter;
	beenPaint: Paint;
	hoverFilter: Filter;
	hoverPaint: Paint;
	hitPaint: Paint;
}

const PRIMARY = "#fd7e14";

/**
 * Every country, drawn invisibly, so that the pointer has something to land on over a country the
 * reader has not been to. MapLibre still finds features under the pointer on a layer it draws
 * with no opacity.
 */
const HIT_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": 0 };
const BEEN_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": 0.6 };
const HOVER_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": 0.25 };

export const useGlobeLayers = (hoveredCountry: string | undefined): GlobeLayers => {
	const selectedCountries = useAtomValue(selectedCountriesAtom);

	const beenFilter: Filter = useMemo(
		() => ["in", ["get", "iso_3166_1"], ["literal", selectedCountries]],
		[selectedCountries],
	);
	const hoverFilter: Filter = useMemo(
		() => ["==", ["get", "iso_3166_1"], hoveredCountry ?? ""],
		[hoveredCountry],
	);

	return useMemo(
		() => ({
			beenFilter,
			beenPaint: BEEN_PAINT,
			hitPaint: HIT_PAINT,
			hoverFilter,
			hoverPaint: HOVER_PAINT,
		}),
		[beenFilter, hoverFilter],
	);
};
