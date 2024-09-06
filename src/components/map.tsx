import { centerOfMass, featureCollection } from '@turf/turf';
import { type FillExtrusionPaint, type FillPaint } from 'mapbox-gl';
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
	type MapRef,
	NavigationControl,
	Map as ReactMapGL,
	Source,
} from 'react-map-gl';

import { useCountries } from '../contexts/countries-context';
import { useMatchMedia } from '../hooks/use-match-media';
import { MapboxLayerKeys, MapboxSourceKeys } from '../models/enums';
import { type ForwardedRefFunction } from '../types/utils';

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

export const Map = memo(
	forwardRef<MapForwardedRef, Props>(({ header }, ref) => {
		const internalRef = useRef<MapRef>(null);

		const prefersDark = useMatchMedia('(prefers-color-scheme: dark)');

		const { countries, focus } = useCountries();

		const selectedCountries = useMemo(() => {
			return countries.filter((c) => c.selected).map((c) => c.iso3166);
		}, [countries]);

		useImperativeHandle(
			/* eslint-disable react-compiler/react-compiler -- This is a bug with the ESLint plugin, this is correct behaviour according to the React docs (see here: https://react.dev/reference/react/useImperativeHandle#exposing-a-custom-ref-handle-to-the-parent-component). */
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
			/* eslint-enable react-compiler/react-compiler */
			[],
		);

		useEffect(() => {
			if (!focus || !internalRef.current) {
				return;
			}
			const { current: map } = internalRef;
			const features = map.querySourceFeatures(
				MapboxSourceKeys.countries,
				{
					sourceLayer: 'country_boundaries',
					filter: ['==', ['get', 'iso_3166_1'], focus],
				},
			);
			if (features.length > 0) {
				const { geometry } = centerOfMass(featureCollection(features));
				const [lat = 0, lon = 0] = geometry.coordinates;
				map.flyTo({ center: [lat, lon], zoom: minZoom });
			}
		}, [focus, internalRef]);

		const beenFilter = useMemo(
			() => ['in', ['get', 'iso_3166_1'], ['literal', selectedCountries]],
			[selectedCountries],
		);
		const beenPaint: FillPaint = useMemo(
			() => ({
				/* eslint-disable @typescript-eslint/naming-convention -- mapbox-gl has specific property names we must use */
				'fill-color': '#fd7e14',
				'fill-opacity': 0.6,
				/* eslint-enable @typescript-eslint/naming-convention */
			}),
			[],
		);

		const buildingsFilter = useMemo(() => ['==', 'extrude', 'true'], []);
		const buildingsPaint: FillExtrusionPaint = useMemo(
			() => ({
				/* eslint-disable @typescript-eslint/naming-convention -- mapbox-gl has specific property names we must use */
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
				/* eslint-enable @typescript-eslint/naming-convention */
			}),
			[selectedCountries],
		);

		return (
			<>
				{header}
				<ReactMapGL
					mapboxAccessToken={apiKeyMapbox ?? ''}
					mapStyle={prefersDark ? darkThemeUrl : lightThemeUrl}
					antialias
					attributionControl={false}
					logoPosition="bottom-right"
					minZoom={minZoom}
					ref={internalRef}
					testMode={testMode}
				>
					<NavigationControl />
					<Source
						id={MapboxSourceKeys.countries}
						type="vector"
						url="mapbox://mapbox.country-boundaries-v1"
					/>
					<Layer
						id={MapboxLayerKeys.been}
						type="fill"
						source={MapboxSourceKeys.countries}
						source-layer="country_boundaries"
						beforeId="national-park"
						filter={beenFilter}
						paint={beenPaint}
					/>
					<Layer
						id={MapboxLayerKeys.buildings}
						type="fill-extrusion"
						source="composite"
						source-layer="building"
						minzoom={15}
						filter={buildingsFilter}
						paint={buildingsPaint}
					/>
				</ReactMapGL>
			</>
		);
	}),
);
Map.displayName = 'Map';
