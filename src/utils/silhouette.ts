import type { Position } from "geojson";

import type { Bounds, CountryBoundary } from "../data/boundaries";

const TURN_DEGREES = 360;
const DEGREES_PER_RADIAN = 180 / Math.PI;
/** How finely a silhouette's points are kept, in units of the box it is drawn in. */
const PRECISION = 10;

const round = (value: number): number => Math.round(value * PRECISION) / PRECISION;

const polygonsOf = (boundary: CountryBoundary): readonly Position[][][] =>
	boundary.geometry.type === "Polygon"
		? [boundary.geometry.coordinates]
		: boundary.geometry.coordinates;

/**
 * A polygon moved by whole turns so its middle sits inside the band of longitude `bounds` spans,
 * which for a country across the antimeridian runs on past 180: the United States frames from the
 * Aleutians to Maine, so its mainland, at -100 or so, is drawn at 260.
 */
const besideBounds = (polygon: readonly Position[][], [west, , east]: Bounds): Position[][] => {
	const longitudes = (polygon[0] ?? []).map(([longitude = 0]) => longitude);
	const middle = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
	const shift = TURN_DEGREES * Math.round(((west + east) / 2 - middle) / TURN_DEGREES);
	return polygon.map((ring) =>
		ring.map(([longitude = 0, latitude = 0]) => [longitude + shift, latitude]),
	);
};

/** Whether a polygon reaches into `bounds` at all, as one an ocean away is not worth drawing. */
const overlaps = (polygon: readonly Position[][], [west, south, east, north]: Bounds): boolean =>
	(polygon[0] ?? []).some(
		([longitude = 0, latitude = 0]) =>
			longitude >= west && longitude <= east && latitude >= south && latitude <= north,
	);

/**
 * One ring as an SVG subpath, dropping points that round onto the one before, and the ring's
 * closing point, which repeats its first and which the path's own close draws back to.
 */
const subpathOf = (points: readonly (readonly [number, number])[]): string => {
	const kept = points
		.slice(0, -1)
		.filter(
			([across, down], index) =>
				index === 0 || across !== points[index - 1]?.[0] || down !== points[index - 1]?.[1],
		);
	return kept.length < 3
		? ""
		: `M${kept.map(([across, down]) => `${String(across)} ${String(down)}`).join("L")}Z`;
};

/**
 * A country's outline as an SVG path, fitted and centred in a `size` square, for drawing into a
 * passport stamp. It frames `bounds`, which is the home landmass for countries whose territories
 * sit oceans away, and draws only what reaches into it. Longitude is narrowed by the cosine of the
 * middle latitude, so a country far from the equator keeps its shape rather than spreading wide.
 */
export const silhouetteOf = (boundary: CountryBoundary, bounds: Bounds, size: number): string => {
	const [west, south, east, north] = bounds;
	const squash = Math.cos((south + north) / 2 / DEGREES_PER_RADIAN);
	const width = (east - west) * squash;
	const height = north - south;
	const scale = size / Math.max(width, height, Number.EPSILON);
	const [left, top] = [(size - width * scale) / 2, (size - height * scale) / 2];

	return polygonsOf(boundary)
		.map((polygon) => besideBounds(polygon, bounds))
		.filter((polygon) => overlaps(polygon, bounds))
		.flatMap((polygon) =>
			polygon.map((ring) =>
				subpathOf(
					ring.map(([longitude = 0, latitude = 0]) => [
						round(left + (longitude - west) * squash * scale),
						round(top + (north - latitude) * scale),
					]),
				),
			),
		)
		.join("");
};
