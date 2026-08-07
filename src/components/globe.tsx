import { useAtomValue } from "jotai";
import type {
	CameraOptions,
	FillExtrusionLayerSpecification,
	FillLayerSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { Layer, Map, NavigationControl, Source } from "react-map-gl/mapbox";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import { useMatchMedia } from "../hooks/use-match-media";
import { MapboxLayerKeys, MapboxSourceKeys } from "../models/enums";
import { focusAtom, selectedCountriesAtom } from "../state/atoms.ts";
import type { ForwardedRefFunction } from "../types/utils";

const apiKeyMapbox = import.meta.env["VITE_API_KEY_MAPBOX"];
const testMode = import.meta.env.MODE === "test";
const darkThemeUrl = "mapbox://styles/mapbox/dark-v11";
const lightThemeUrl = "mapbox://styles/mapbox/light-v11";

const minZoom = 1.8;

export interface MapForwardedRef {
	isSourceLoaded: ForwardedRefFunction<MapRef["isSourceLoaded"]>;
	querySourceFeatures: ForwardedRefFunction<MapRef["querySourceFeatures"]>;
}

export const Globe = memo(
	forwardRef<MapForwardedRef>((_, ref) => {
		const internalRef = useRef<MapRef>(null);

		const prefersDark = useMatchMedia("(prefers-color-scheme: dark)");

		const selectedCountries = useAtomValue(selectedCountriesAtom);
		const focus = useAtomValue(focusAtom);

		useImperativeHandle(
			ref,
			() => ({
				isSourceLoaded: (
					...params: Parameters<MapRef["isSourceLoaded"]>
				): ReturnType<MapRef["isSourceLoaded"]> | undefined => {
					return internalRef.current?.isSourceLoaded(...params);
				},
				querySourceFeatures: (
					...params: Parameters<MapRef["querySourceFeatures"]>
				): ReturnType<MapRef["querySourceFeatures"]> | undefined => {
					return internalRef.current?.querySourceFeatures(...params);
				},
			}),
			[],
		);

		// Where the camera sat before the current focus moved it, so an unselect can undo that
		// move. Held in a ref because it is a detail of this map instance, and reading it should
		// never trigger a render.
		const cameraBeforeFocus = useRef<CameraOptions | null>(null);

		useEffect(() => {
			const { current: map } = internalRef;
			if (!map || !focus) {
				return;
			}
			if (focus.type === "undo") {
				const camera = cameraBeforeFocus.current;
				// An undo is only good once, and only if we still have somewhere to go back to.
				cameraBeforeFocus.current = null;
				if (camera) {
					map.easeTo(camera);
				}
				return;
			}
			const { bounds } = focus.country;
			if (!bounds) {
				return;
			}
			cameraBeforeFocus.current = {
				bearing: map.getBearing(),
				center: map.getCenter(),
				pitch: map.getPitch(),
				zoom: map.getZoom(),
			};
			map.fitBounds(bounds);
		}, [focus]);

		const handleMoveStart = useCallback((event: ViewStateChangeEvent) => {
			// Only moves the user made themselves carry an `originalEvent`; the ones we make with
			// `fitBounds`/`easeTo` do not. Once they have moved the map, they have a view they
			// chose, and yanking it back to a camera they never asked for would be the surprise.
			if ("originalEvent" in event && event.originalEvent !== undefined) {
				cameraBeforeFocus.current = null;
			}
		}, []);

		const beenFilter: FillExtrusionLayerSpecification["filter"] = useMemo(
			() => ["in", ["get", "iso_3166_1"], ["literal", selectedCountries]],
			[selectedCountries],
		);
		const beenPaint: FillLayerSpecification["paint"] = useMemo(
			() => ({
				"fill-color": "#fd7e14",
				"fill-opacity": 0.6,
			}),
			[],
		);

		const buildingsFilter: FillExtrusionLayerSpecification["filter"] = useMemo(
			() => ["==", "extrude", "true"],
			[],
		);
		const buildingsPaint: FillExtrusionLayerSpecification["paint"] = useMemo(
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
				<Source
					id={MapboxSourceKeys.Countries}
					type="vector"
					url="mapbox://mapbox.country-boundaries-v1"
				/>
				<Layer
					id={MapboxLayerKeys.Been}
					type="fill"
					source={MapboxSourceKeys.Countries}
					source-layer="country_boundaries"
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
