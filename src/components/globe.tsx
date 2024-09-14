import type { FillExtrusionPaint, FillPaint } from 'mapbox-gl';
import {
	type ReactNode,
	forwardRef,
	memo,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {
	Layer,
	Map,
	type MapRef,
	NavigationControl,
	Source,
} from 'react-map-gl';
import { useCountries } from '../contexts/countries-context.ts';
import { useMatchMedia } from '../hooks/use-match-media.ts';
import { MapboxLayerKeys, MapboxSourceKeys } from '../models/enums.ts';
import type { ForwardedRefFunction } from '../types/utils.ts';

import 'mapbox-gl/dist/mapbox-gl.css';

const apiKeyMapbox = import.meta.env['VITE_API_KEY_MAPBOX'] as
	| string
	| undefined;
const testMode = import.meta.env.MODE === 'test';
const darkThemeUrl = 'mapbox://styles/mapbox/dark-v11';
const lightThemeUrl = 'mapbox://styles/mapbox/light-v11';

const minZoom = 1.8;

export interface MapForwardedRef {
	isSourceLoaded: ForwardedRefFunction<MapRef['isSourceLoaded']>;
	querySourceFeatures: ForwardedRefFunction<MapRef['querySourceFeatures']>;
}

interface Props {
	header: ReactNode;
}

export const Globe = memo(
	forwardRef<MapForwardedRef, Props>(({ header }, ref) => {
		const internalRef = useRef<MapRef>(null);

		const prefersDark = useMatchMedia('(prefers-color-scheme: dark)');

		const { countries, focus } = useCountries();

		const selectedCountries = useMemo(() => {
			return countries.filter((c) => c.selected).map((c) => c.iso3166);
		}, [countries]);

		useImperativeHandle(
			ref,
			() => ({
				isSourceLoaded: (
					...params: Parameters<MapRef['isSourceLoaded']>
				) => {
					return internalRef.current?.isSourceLoaded(...params);
				},
				querySourceFeatures: (
					...params: Parameters<MapRef['querySourceFeatures']>
				) => {
					return internalRef.current?.querySourceFeatures(...params);
				},
			}),
			[],
		);

		useEffect(() => {
			if (!focus?.bounds) {
				return;
			}
			const { current: map } = internalRef;
			map?.fitBounds(focus.bounds);
		}, [focus]);

		const beenFilter = useMemo(
			() => ['in', ['get', 'iso_3166_1'], ['literal', selectedCountries]],
			[selectedCountries],
		);
		const beenPaint: FillPaint = useMemo(
			() => ({
				'fill-color': '#fd7e14',
				'fill-opacity': 0.6,
			}),
			[],
		);

		const buildingsFilter = useMemo(() => ['==', 'extrude', 'true'], []);
		const buildingsPaint: FillExtrusionPaint = useMemo(
			() => ({
				'fill-extrusion-color': [
					'case',
					[
						'in',
						['get', 'iso_3166_1'],
						['literal', selectedCountries],
					],
					'#fd7e14',
					'#fd7e14',
				],
				'fill-extrusion-height': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'height'],
				],
				'fill-extrusion-base': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'min_height'],
				],
				'fill-extrusion-opacity': 0.6,
			}),
			[selectedCountries],
		);

		return (
			<>
				{header}
				<Map
					mapboxAccessToken={apiKeyMapbox ?? ''}
					mapStyle={prefersDark ? darkThemeUrl : lightThemeUrl}
					antialias={true}
					attributionControl={false}
					logoPosition="bottom-right"
					minZoom={minZoom}
					ref={internalRef}
					testMode={testMode}
				>
					<NavigationControl />
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
			</>
		);
	}),
);
Globe.displayName = 'Map';
