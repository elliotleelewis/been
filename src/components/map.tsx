import { centerOfMass, featureCollection } from '@turf/turf';
import { type FillExtrusionPaint, type FillPaint } from 'mapbox-gl';
import {
	type FC,
	type ReactNode,
	memo,
	useEffect,
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

const apiKeyMapbox = import.meta.env['VITE_API_KEY_MAPBOX'] as
	| string
	| undefined;
const darkThemeUrl = 'mapbox://styles/mapbox/dark-v11';
const lightThemeUrl = 'mapbox://styles/mapbox/light-v11';

const minZoom = 1.8;

interface Props {
	header: ReactNode;
}

export const Map: FC<Props> = memo(({ header }) => {
	const mapRef = useRef<MapRef>(null);
	const prefersDark = useMatchMedia('(prefers-color-scheme: dark)');

	const { countries, focus } = useCountries();

	const selectedCountries = useMemo(() => {
		return countries.filter((c) => c.selected).map((c) => c.iso3166);
	}, [countries]);

	useEffect(() => {
		if (!focus || !mapRef.current) {
			return;
		}
		const { current: map } = mapRef;
		const features = map.querySourceFeatures('countries', {
			sourceLayer: 'country_boundaries',
			filter: ['==', ['get', 'iso_3166_1'], focus],
		});
		if (features.length > 0) {
			const { geometry } = centerOfMass(featureCollection(features));
			const [lat = 0, lon = 0] = geometry.coordinates;
			map.flyTo({ center: [lat, lon], zoom: minZoom });
		}
	}, [focus, mapRef]);

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
				['in', ['get', 'iso_3166_1'], ['literal', selectedCountries]],
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
				ref={mapRef}
			>
				<NavigationControl />
				<Source
					id="countries"
					type="vector"
					url="mapbox://mapbox.country-boundaries-v1"
				/>
				<Layer
					id="been"
					type="fill"
					source="countries"
					source-layer="country_boundaries"
					beforeId="national-park"
					filter={beenFilter}
					paint={beenPaint}
				/>
				<Layer
					id="buildings"
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
});
Map.displayName = 'Map';
