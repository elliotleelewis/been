import { useAtomValue } from "jotai";
import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { Layer, Map, NavigationControl, Source } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";

import { useBasemap } from "../hooks/use-basemap";
import { useCountryBoundaries } from "../hooks/use-country-boundaries";
import { useFocusCamera } from "../hooks/use-focus-camera";
import { useGlobeLayers } from "../hooks/use-globe-layers";
import { MapLayerKeys, MapSourceKeys } from "../models/enums";
import { focusAtom, selectedCountriesAtom } from "../state/atoms.ts";
import type { ForwardedRefFunction } from "../types/utils";

import "maplibre-gl/dist/maplibre-gl.css";

const minZoom = 1.8;

export interface MapForwardedRef {
	readonly isSourceLoaded: ForwardedRefFunction<MapRef["isSourceLoaded"]>;
	readonly querySourceFeatures: ForwardedRefFunction<MapRef["querySourceFeatures"]>;
}

export const Globe = memo(
	forwardRef<MapForwardedRef>((_props, ref) => {
		const internalRef = useRef<MapRef>(null);

		const selectedCountries = useAtomValue(selectedCountriesAtom);
		const focus = useAtomValue(focusAtom);

		const boundaries = useCountryBoundaries();
		const { labelsLayerId, onStyleData: handleStyleData, styleUrl } = useBasemap();

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

		const { beenFilter, beenPaint } = useGlobeLayers(selectedCountries);

		return (
			<Map
				mapStyle={styleUrl}
				canvasContextAttributes={{ antialias: true }}
				minZoom={minZoom}
				onMoveStart={handleMoveStart}
				onStyleData={handleStyleData}
				projection="globe"
				ref={internalRef}
			>
				<NavigationControl showCompass={false} />
				<Source id={MapSourceKeys.Countries} type="geojson" data={boundaries} />
				{/* Held back until the layer it goes under has a name, because `beforeId` has to be
				absent rather than undefined to mean "on top". Nothing is lost by waiting: the fill
				cannot be added before the style it sits in has loaded either way. */}
				{labelsLayerId === undefined ? null : (
					<Layer
						id={MapLayerKeys.Been}
						type="fill"
						source={MapSourceKeys.Countries}
						beforeId={labelsLayerId}
						filter={beenFilter}
						paint={beenPaint}
					/>
				)}
			</Map>
		);
	}),
);
Globe.displayName = "Globe";
