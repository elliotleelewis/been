import { hashOf } from "../core/hash.ts";
import type { M49Region } from "../core/m49.ts";
import { STAMP_CAPTIONS, STAMP_INKS, STAMP_SHAPES } from "./types.ts";
import type { StampDesign } from "./types.ts";

/** The furthest a stamp is turned either way, in degrees. */
const MAX_ROTATION = 14;
/** The furthest a stamp sits off its place on the page either way, in pixels. */
const MAX_OFFSET = 10;
const SEEDS = 997;

/** One of `options`, picked by `hash` after it has been divided by `stride`. */
const pick = <Option>(
	options: readonly [Option, ...Option[]],
	hash: number,
	stride: number,
): Option => options[Math.floor(hash / stride) % options.length] ?? options[0];

/** A number between `-limit` and `limit`, picked by `hash` after it has been divided by `stride`. */
const spread = (limit: number, hash: number, stride: number): number =>
	(Math.floor(hash / stride) % (limit * 2 + 1)) - limit;

/**
 * How a country's stamp looks, worked out from its code alone, so it is the same every time and
 * neighbouring countries rarely share a shape. Its ink comes from its region.
 */
export const stampDesignOf = (code: string, region: M49Region): StampDesign => {
	const hash = hashOf(`stamp:${code}`);
	return {
		caption: pick(STAMP_CAPTIONS, hash, 7),
		ink: STAMP_INKS[region],
		offset: [spread(MAX_OFFSET, hash, 11), spread(MAX_OFFSET, hash, 13)],
		rotation: spread(MAX_ROTATION, hash, 3),
		seed: hash % SEEDS,
		shape: pick(STAMP_SHAPES, hash, 1),
	};
};
