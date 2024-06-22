export type Coordinate = [number, number];
export type NestedCoordinates = Coordinate | NestedCoordinates[];

/**
 * Flattens a deeply nested array of coordinates.
 *
 * @param nestedCoords The nested array of coordinates.
 * @returns A flat array of coordinates.
 */
export const flattenCoordinates = (
	nestedCoords: NestedCoordinates,
): Coordinate[] => {
	const result: Coordinate[] = [];

	const flatten = (coords: NestedCoordinates) => {
		if (!coords[0]) {
			return;
		} else if (Array.isArray(coords[0])) {
			for (const coord of coords as NestedCoordinates[]) {
				flatten(coord);
			}
		} else {
			result.push(coords as Coordinate);
		}
	};

	flatten(nestedCoords);
	return result;
};

/**
 * Calculates the centroid of a polygon.
 *
 * @param polygon A flat array of coordinates representing a polygon.
 * @returns The centroid coordinate of the polygon.
 */
export const calculatePolygonCentroid = (polygon: Coordinate[]): Coordinate => {
	let xSum = 0;
	let ySum = 0;
	let areaSum = 0;

	for (let i = 0; i < polygon.length; i++) {
		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		const [x1, y1] = polygon[i]!;
		const [x2, y2] = polygon[(i + 1) % polygon.length]!;
		/* eslint-enable @typescript-eslint/no-non-null-assertion */

		const area = x1 * y2 - x2 * y1;
		xSum += (x1 + x2) * area;
		ySum += (y1 + y2) * area;
		areaSum += area;
	}

	areaSum /= 2;
	const centroidX = xSum / (6 * areaSum);
	const centroidY = ySum / (6 * areaSum);

	return [centroidX, centroidY];
};

/**
 * Calculates the center of a set of coordinates or shapes.
 *
 * @param coordinates A flat array of coordinates.
 * @returns The center coordinate.
 */
export const calculateCenter = (coordinates: Coordinate[]): Coordinate => {
	if (coordinates.length === 0) {
		return [0, 0];
	}

	const total = coordinates.reduce(
		(acc, [lat, lon]) => {
			acc[0] += lat;
			acc[1] += lon;
			return acc;
		},
		[0, 0],
	);

	const count = coordinates.length;
	return [total[0] / count, total[1] / count];
};

/**
 * Processes nested coordinates and calculates the combined center of mass.
 *
 * @param nestedCoords The nested array of coordinates or shapes.
 * @returns The center of mass coordinate.
 */
export const getCoordsCenter = (
	nestedCoords: NestedCoordinates,
): Coordinate => {
	const flatCoords: Coordinate[] = [];

	const processCoords = (coords: NestedCoordinates) => {
		if (Array.isArray(coords[0])) {
			for (const coord of coords as NestedCoordinates[]) {
				if (Array.isArray(coord[0])) {
					const flat = flattenCoordinates(coord);
					const centroid = calculatePolygonCentroid(flat);
					// This is a shape (polygon)
					flatCoords.push(centroid);
				} else {
					// This is a point
					flatCoords.push(coord as Coordinate);
				}
			}
		} else {
			flatCoords.push(coords as Coordinate);
		}
	};

	processCoords(nestedCoords);
	return calculateCenter(flatCoords);
};
