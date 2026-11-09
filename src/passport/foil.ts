// How the light falls on a foil visa: where it catches, how strongly, and how far the visa tilts,
// worked out from the reader's pointer, the tilt of their device, or a slow drift when neither is
// steering it, and eased so the visa never jumps from one to the next.

/** Where the light catches a foil visa, and how it sits. */
export interface Foil {
	/** Across and down the visa, from 0 at its left or top edge to 1 at its right or bottom. */
	readonly across: number;
	readonly down: number;
	/** How brightly it catches the light, from 0 to 1. */
	readonly shine: number;
}

/** The light straight on, a little dull, as it is when nothing is moving it. */
export const RESTING_FOIL: Foil = { across: 0.5, down: 0.5, shine: 0.35 };

/** How far a foil visa tilts towards the light at most, in degrees, enough to read as card. */
const MAX_TILT = 7;
/** How long the light takes to cover most of the way to where it is headed, in milliseconds. */
const EASE_MS = 140;
/** How many degrees a device has to tip, either way, to move the light from the middle to an edge. */
const DEVICE_RANGE = 30;
/** The periods of the drift across and down, in milliseconds, unrelated so it never repeats. */
const DRIFT_ACROSS_MS = 2300;
const DRIFT_DOWN_MS = 3100;

const clamp = (value: number): number => Math.min(Math.max(value, 0), 1);

/** The light under a pointer at `point` on a visa whose box is `box`, at its brightest. */
export const foilOfPointer = (
	[left, top, width, height]: readonly [number, number, number, number],
	[pointerAcross, pointerDown]: readonly [number, number],
): Foil => ({
	across: width === 0 ? 0.5 : clamp((pointerAcross - left) / width),
	down: height === 0 ? 0.5 : clamp((pointerDown - top) / height),
	shine: 1,
});

/**
 * The light on a visa held in a device tipped by `gamma` degrees to the side and `beta` degrees
 * forwards, measured from how it was held when it began reporting.
 */
export const foilOfDevice = (gamma: number, beta: number, restingBeta: number): Foil => ({
	across: clamp(0.5 + gamma / DEVICE_RANGE / 2),
	down: clamp(0.5 + (beta - restingBeta) / DEVICE_RANGE / 2),
	shine: 0.8,
});

/** The light drifting slowly over a visa nothing is steering, `time` milliseconds in. */
export const driftingFoilAt = (time: number): Foil => ({
	across: 0.5 + 0.3 * Math.sin((time / DRIFT_ACROSS_MS) * Math.PI),
	down: 0.5 + 0.25 * Math.sin((time / DRIFT_DOWN_MS) * Math.PI),
	shine: 0.45,
});

/**
 * The light `elapsed` milliseconds on from `current`, eased towards `target`. It covers the same
 * share of what is left each moment, however often it is asked, so it slows as it arrives.
 */
export const foilTowards = (current: Foil, target: Foil, elapsed: number): Foil => {
	const share = 1 - Math.exp(-elapsed / EASE_MS);
	return {
		across: current.across + (target.across - current.across) * share,
		down: current.down + (target.down - current.down) * share,
		shine: current.shine + (target.shine - current.shine) * share,
	};
};

/**
 * The custom properties a foil visa's styles read, for the light at `foil`: where it catches, how
 * brightly, and how far the visa tilts, its near edge dipping away from the light.
 */
export const foilPropertiesOf = ({
	across,
	down,
	shine,
}: Foil): Readonly<Record<string, string>> => ({
	"--foil-shine": shine.toFixed(3),
	"--foil-tilt-x": `${((0.5 - down) * 2 * MAX_TILT).toFixed(2)}deg`,
	"--foil-tilt-y": `${((across - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`,
	"--foil-x": `${(across * 100).toFixed(2)}%`,
	"--foil-y": `${(down * 100).toFixed(2)}%`,
});
