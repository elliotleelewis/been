import { useAtomValue } from "jotai";
import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { Layer, Map, NavigationControl, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";

import { useCountryBoundaries } from "../hooks/use-country-boundaries";
import { useFocusCamera } from "../hooks/use-focus-camera";
import { useGlobeLayers } from "../hooks/use-globe-layers";
import { useMatchMedia } from "../hooks/use-match-media";
import { MapboxLayerKeys, MapboxSourceKeys } from "../models/enums";
import { focusAtom, selectedCountriesAtom } from "../state/atoms.ts";
import type { ForwardedRefFunction } from "../types/utils";

import "mapbox-gl/dist/mapbox-gl.css";

const apiKeyMapbox = import.meta.env["VITE_API_KEY_MAPBOX"];
const testMode = import.meta.env.MODE === "test";
const darkThemeUrl = "mapbox://styles/mapbox/dark-v11";
const lightThemeUrl = "mapbox://styles/mapbox/light-v11";

const minZoom = 1.8;

export interface MapForwardedRef {
	readonly isSourceLoaded: ForwardedRefFunction<MapRef["isSourceLoaded"]>;
	readonly querySourceFeatures: ForwardedRefFunction<MapRef["querySourceFeatures"]>;
}

export const Globe = memo(
	forwardRef<MapForwardedRef>((_props, ref) => {
		const internalRef = useRef<MapRef>(null);

		const prefersDark = useMatchMedia("(prefers-color-scheme: dark)");

		const selectedCountries = useAtomValue(selectedCountriesAtom);
		const focus = useAtomValue(focusAtom);

		const boundaries = useCountryBoundaries();

		useImperativeHandle(
			ref,
			() => ({
				isSourceLoaded: (
					...params: Parameters<MapRef["isSourceLoaded"]>
				): ReturnType<MapRef["isSourceLoaded"]> | undefined =>
					internalRef.current?.isSourceLoaded(...params),
				querySourceFeatures: (
					...params: Parameters<MapRef["querySourceFeatures"]>
				): ReturnType<MapRef["querySourceFeatures"]> | undefined =>
					internalRef.current?.querySourceFeatures(...params),
			}),
			[],
		);

		const handleMoveStart = useFocusCamera(internalRef, focus);

		const { beenFilter, beenPaint, buildingsFilter, buildingsPaint } =
			useGlobeLayers(selectedCountries);

		return (
			<Map
				mapboxAccessToken={apiKeyMapbox ?? ""}
				mapStyle={prefersDark ? darkThemeUrl : lightThemeUrl}
				antialias
				attributionControl={false}
				logoPosition="bottom-right"
				minZoom={minZoom}
				onMoveStart={handleMoveStart}
				ref={internalRef}
				testMode={testMode}
			>
				<NavigationControl showCompass={false} />
				<Source id={MapboxSourceKeys.Countries} type="geojson" data={boundaries} />
				<Layer
					id={MapboxLayerKeys.Been}
					type="fill"
					source={MapboxSourceKeys.Countries}
					beforeId="national-park"
					filter={beenFilter}
					paint={beenPaint}
				/>
				<Layer
					id={MapboxLayerKeys.Buildings}
					type="fill-extrusion"
					source="composite"
					source-layer="building"
					minzoom={15}
					filter={buildingsFilter}
					paint={buildingsPaint}
				/>
			</Map>
		);
	}),
);
Globe.displayName = "Globe";
