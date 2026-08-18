import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useCallback, useMemo, useState } from "react";
import type { MapStyleDataEvent } from "react-map-gl/maplibre";

import { useMatchMedia } from "./use-match-media";

// MapLibre parses every tile, vector and GeoJSON alike, in a worker it locates at run time from
// its own module URL. No bundler can see through that, so the worker file never reaches the build
// and the map draws nothing but its background colour. Handing it the URL the bundler does emit is
// what makes the map draw at all, which is why this sits with the map rather than at the entry
// point: the tests render the globe directly and would otherwise be testing a map that cannot draw.
// oxlint-disable-next-line require-hook -- Configuring the map is the point, not test setup.
setWorkerUrl(workerUrl);

// CARTO's OpenStreetMap basemaps, which need no API key. Their licences are what the map credits
// through the attribution control MapLibre shows by default.
const DARK_STYLE_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const LIGHT_STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export interface Basemap {
	// The first of the style's label layers, which is what the country fill is drawn under. It is
	// undefined until a style has loaded.
	readonly labelsLayerId: string | undefined;
	readonly onStyleData: (event: MapStyleDataEvent) => void;
	readonly styleUrl: string;
}

// The map underneath the countries: which of the two styles the reader's theme asks for, and where
// that style keeps its labels. Which layer that is belongs to the style rather than to us, and
// MapLibre drops a layer whose `beforeId` names nothing without throwing, so the id is read back
// off whichever style actually loaded instead of being written down here.
export const useBasemap = (): Basemap => {
	const prefersDark = useMatchMedia("(prefers-color-scheme: dark)");
	const [labelsLayerId, setLabelsLayerId] = useState<string>();

	// Every style load, not just the first: switching between the light and dark basemaps builds
	// the layers again, off a style whose labels are its own.
	const onStyleData = useCallback((event: MapStyleDataEvent): void => {
		setLabelsLayerId(event.target.getStyle().layers.find((layer) => layer.type === "symbol")?.id);
	}, []);

	const styleUrl = prefersDark ? DARK_STYLE_URL : LIGHT_STYLE_URL;

	return useMemo(
		() => ({ labelsLayerId, onStyleData, styleUrl }),
		[labelsLayerId, onStyleData, styleUrl],
	);
};
