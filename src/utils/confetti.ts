import { STAMP_INKS } from "../models/stamp";
import { hashOf } from "./hash";

/** One piece of the confetti a visa moment throws: a tiny stamp, in one of the stamp inks. */
export interface ConfettiPiece {
	readonly ink: string;
	readonly round: boolean;
	/** Its width and height, in pixels. */
	readonly size: number;
	/** Where the burst throws it, across and down from the middle of the screen, in pixels. */
	readonly burst: readonly [number, number];
	/** How far it then falls, in pixels, and how far it turns on the way, in degrees. */
	readonly fall: number;
	readonly spin: number;
	readonly delay: number;
}

const INKS = Object.values(STAMP_INKS);
const TURN = Math.PI * 2;

/** A number from `low` to `high`, picked by `hash` after it has been divided by `stride`. */
const between = ([low, high]: readonly [number, number], hash: number, stride: number): number =>
	low + (Math.floor(hash / stride) % (high - low + 1));

/**
 * The pieces a visa moment's confetti is made of, thrown out evenly all round, each a little
 * differently. They are the same every time, so the moment is too.
 */
export const confettiOf = (count: number): readonly ConfettiPiece[] =>
	Array.from({ length: count }, (_piece, index) => {
		const hash = hashOf(`confetti:${String(index)}`);
		const angle = (index / count) * TURN;
		const reach = between([110, 230], hash, 3);
		return {
			burst: [Math.cos(angle) * reach, Math.sin(angle) * reach * 0.8 - 60],
			delay: between([0, 120], hash, 7),
			fall: between([220, 420], hash, 11),
			ink: INKS[hash % INKS.length] ?? "#4b3a8c",
			round: hash % 2 === 0,
			size: between([9, 16], hash, 13),
			spin: between([-260, 260], hash, 17),
		};
	});
