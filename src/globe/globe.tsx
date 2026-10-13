import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { Layer, Map, NavigationControl, Source } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";

import { GlobeLabel } from "./globe-label.tsx";
import { MapLayerKeys, MapSourceKeys } from "./types.ts";
import type { ForwardedRefFunction } from "./types.ts";
import { useBasemap } from "./use-basemap.ts";
import { useCountryBoundaries } from "./use-country-boundaries.ts";
import { useCountryPointer } from "./use-country-pointer.ts";
import { useGlobeCamera } from "./use-globe-camera.ts";
import { useGlobeLayers } from "./use-globe-layers.ts";

import "maplibre-gl/dist/maplibre-gl.css";

const minZoom = 1.8;

/** The layer every country is drawn on, which is what clicks and the pointer are tested against. */
const INTERACTIVE_LAYER_IDS = [MapLayerKeys.Hit];

export interface MapForwardedRef {
	readonly isSourceLoaded: ForwardedRefFunction<MapRef["isSourceLoaded"]>;
	readonly querySourceFeatures: ForwardedRefFunction<MapRef["querySourceFeatures"]>;
}

export const Globe = memo(
	forwardRef<MapForwardedRef>((_props, ref) => {
		const internalRef = useRef<MapRef>(null);

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

		const handleMoveStart = useGlobeCamera(internalRef);
		const {
			hover,
			onClick: handleClick,
			onMouseMove: handleMouseMove,
			onMouseOut: handleMouseOut,
		} = useCountryPointer();
		const { beenFilter, beenPaint, freshFilter, freshPaint, hitPaint, hoverFilter, hoverPaint } =
			useGlobeLayers(hover?.code);

		return (
			<Map
				mapStyle={styleUrl}
				canvasContextAttributes={{ antialias: true }}
				cursor={hover === null ? "" : "pointer"}
				// Clicking a country ticks it, so the two clicks of a double click would tick it and
				// untick it again on the way to zooming in. Scrolling, pinching and the buttons still zoom.
				doubleClickZoom={false}
				interactiveLayerIds={INTERACTIVE_LAYER_IDS}
				minZoom={minZoom}
				onClick={handleClick}
				onMouseMove={handleMouseMove}
				onMouseOut={handleMouseOut}
				onMoveStart={handleMoveStart}
				onStyleData={handleStyleData}
				projection="globe"
				ref={internalRef}
			>
				<NavigationControl showCompass={false} />
				<Source id={MapSourceKeys.Countries} type="geojson" data={boundaries} />
				{/* Held back until the layers they go under have a name, because `beforeId` has to be
				absent rather than undefined to mean "on top". Nothing is lost by waiting: the fills
				cannot be added before the style they sit in has loaded either way. */}
				{labelsLayerId === undefined ? null : (
					<>
						<Layer
							id={MapLayerKeys.Hit}
							type="fill"
							source={MapSourceKeys.Countries}
							beforeId={labelsLayerId}
							paint={hitPaint}
						/>
						<Layer
							id={MapLayerKeys.Been}
							type="fill"
							source={MapSourceKeys.Countries}
							beforeId={labelsLayerId}
							filter={beenFilter}
							paint={beenPaint}
						/>
						<Layer
							id={MapLayerKeys.Fresh}
							type="fill"
							source={MapSourceKeys.Countries}
							beforeId={labelsLayerId}
							filter={freshFilter}
							paint={freshPaint}
						/>
						<Layer
							id={MapLayerKeys.Hover}
							type="fill"
							source={MapSourceKeys.Countries}
							beforeId={labelsLayerId}
							filter={hoverFilter}
							paint={hoverPaint}
						/>
					</>
				)}
				{hover === null ? null : <GlobeLabel hover={hover} />}
			</Map>
		);
	}),
);
Globe.displayName = "Globe";
