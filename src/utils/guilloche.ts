/** How many points each curve of a guilloché pattern is drawn through. */
const STEPS = 240;
const TURN = Math.PI * 2;

/** A list of points as an SVG path, rounded to keep it short. */
const pathThrough = (points: readonly (readonly [number, number])[], closed: boolean): string =>
	points
		.map(
			([across, down], index) =>
				`${index === 0 ? "M" : "L"}${across.toFixed(1)} ${down.toFixed(1)}`,
		)
		.join("")
		.concat(closed ? "Z" : "");

/**
 * A rosette: a ring whose radius swells and narrows `lobes` times on the way round, the curve
 * engraved banknotes and visas are patterned with. `phase` turns it, so several drawn a little
 * apart weave into a band.
 */
export const rosettePath = (
	[centreAcross, centreDown, radius]: readonly [number, number, number],
	[lobes, depth]: readonly [number, number],
	phase: number,
): string =>
	pathThrough(
		Array.from({ length: STEPS }, (_step, index) => {
			const angle = (index / STEPS) * TURN;
			const reach = radius + depth * Math.sin(lobes * angle + phase);
			return [
				centreAcross + reach * Math.cos(angle),
				centreDown + reach * Math.sin(angle),
			] as const;
		}),
		true,
	);

/**
 * A wave running `width` across a visa at height `down`, rising and falling `waves` times, the
 * line the background of an engraved document is woven from.
 */
export const wavePath = (
	[width, down]: readonly [number, number],
	[waves, height]: readonly [number, number],
	phase: number,
): string =>
	pathThrough(
		Array.from({ length: STEPS + 1 }, (_step, index) => {
			const across = (index / STEPS) * width;
			return [across, down + height * Math.sin((across / width) * waves * TURN + phase)] as const;
		}),
		false,
	);
