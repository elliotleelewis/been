import { render } from '@testing-library/react';
import { bbox, featureCollection } from '@turf/turf';
import { createRef } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { countries } from '../data/countries';
import { MapboxSourceKeys } from '../models/enums';
import { Globe, type MapForwardedRef } from './globe';

describe('Globe', () => {
	beforeAll(() => {
		vi.spyOn(window, 'matchMedia').mockImplementation(
			() =>
				({
					matches: false,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				}) satisfies Partial<MediaQueryList> as unknown as MediaQueryList,
		);
	});

	it('should render', () => {
		const result = render(<Globe />);

		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should accept a ref', () => {
		const map = createRef<MapForwardedRef>();
		const result = render(<Globe ref={map} />);

		expect(map.current).toBeTruthy();
		expect(result.asFragment()).toMatchSnapshot();
	});

	it('should have geojson data for every country in dataset', async () => {
		const map = createRef<MapForwardedRef>();
		render(<Globe ref={map} />);

		await vi.waitUntil(
			() => map.current?.isSourceLoaded(MapboxSourceKeys.Countries),
			{
				timeout: 5000,
			},
		);

		expect(map.current?.querySourceFeatures).toBeTruthy();
		for (const { iso3166, name, bounds } of countries) {
			const features = map.current?.querySourceFeatures(
				MapboxSourceKeys.Countries,
				{
					sourceLayer: 'country_boundaries',
					filter: ['==', ['get', 'iso_3166_1'], iso3166],
				},
			);
			expect.soft(features?.length, name).toBeGreaterThanOrEqual(1);
			expect
				.soft(bounds, name)
				.toEqual(bbox(featureCollection(features ?? [])));
		}
	});
});
