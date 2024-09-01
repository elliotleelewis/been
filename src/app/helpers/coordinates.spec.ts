import {
	type Coordinate,
	type NestedCoordinates,
	calculateCenter,
	calculatePolygonCentroid,
	flattenCoordinates,
} from './coordinates';

describe('flattenCoordinates function', () => {
	it('flattens a deeply nested array of coordinates', () => {
		const nestedCoords: NestedCoordinates = [
			[1, 2],
			[3, 4],
			[
				[5, 6],
				[
					[7, 8],
					[9, 10],
				],
			],
		];

		const flattened = flattenCoordinates(nestedCoords);
		expect(flattened).toEqual([
			[1, 2],
			[3, 4],
			[5, 6],
			[7, 8],
			[9, 10],
		]);
	});

	it('handles empty input', () => {
		const flattened = flattenCoordinates([]);
		expect(flattened).toEqual([]);
	});
});

describe('calculatePolygonCentroid function', () => {
	it('calculates centroid of a polygon', () => {
		const polygon: Coordinate[] = [
			[0, 0],
			[4, 0],
			[4, 4],
			[0, 4],
		];

		const centroid = calculatePolygonCentroid(polygon);
		expect(centroid).toEqual([2, 2]);
	});

	it('handles polygons with negative coordinates', () => {
		const polygon: Coordinate[] = [
			[-1, -1],
			[1, -1],
			[1, 1],
			[-1, 1],
		];

		const centroid = calculatePolygonCentroid(polygon);
		expect(centroid).toEqual([0, 0]);
	});
});

describe('calculateCenter function', () => {
	it('calculates center of a set of coordinates', () => {
		const coordinates: Coordinate[] = [
			[1, 2],
			[3, 4],
			[5, 6],
		];

		const center = calculateCenter(coordinates);
		expect(center).toEqual([3, 4]);
	});

	it('handles empty input', () => {
		const center = calculateCenter([]);
		expect(center).toEqual([0, 0]);
	});
});
