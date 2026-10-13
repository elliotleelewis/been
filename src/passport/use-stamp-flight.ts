import { useEffect } from "react";
import type { RefObject } from "react";

/** How long the stamp takes to come down onto the page, in milliseconds. */
const THUD_MS = 420;
/** How long it sits there before it goes, so it can be read, unless told otherwise. */
const HOLD_MS = 650;
/** How long it takes to fly into the passport. */
const FLIGHT_MS = 520;
/** How long the passport button swells as the stamp lands in it. */
const PULSE_MS = 360;
/** A short buzz as the stamp lands, on the phones that allow one. */
const THUD_VIBRATION_MS = 18;

/** The distance across and down from the middle of one box to the middle of another. */
const travelBetween = (from: DOMRect, to: DOMRect | undefined): readonly [number, number] =>
	to === undefined
		? [0, 0]
		: [
				to.x + to.width / 2 - (from.x + from.width / 2),
				to.y + to.height / 2 - (from.y + from.height / 2),
			];

/** Buzzes the phone, where the browser lets a page do that, which on iPhones it does not. */
const vibrate = (): void => {
	if (typeof globalThis.navigator.vibrate === "function") {
		globalThis.navigator.vibrate(THUD_VIBRATION_MS);
	}
};

/** What an animation cut short by the next stamp moment rejects with, which is no failure. */
const ignoreCancellation = (): null => null;

/** The stamp coming down onto the page: from large and turned, to a squash, to rest. */
const THUD_FRAMES: Keyframe[] = [
	{ opacity: 0, transform: "scale(1.9) rotate(-9deg)" },
	{ offset: 0.7, opacity: 1, transform: "scale(0.94) rotate(0deg)" },
	{ opacity: 1, transform: "scale(1) rotate(0deg)" },
];

/** The passport button swelling as a stamp lands in it. */
const PULSE_FRAMES: Keyframe[] = [
	{ transform: "scale(1)" },
	{ transform: "scale(1.3)" },
	{ transform: "scale(1)" },
];

/** Where a moment's stamp flies to, `across` and `down`, and how long it sits before it goes. */
interface Path {
	readonly travel: readonly [number, number];
	readonly hold: number;
}

/**
 * Animates a stamp coming down with a thud, sitting to be read, then flying into the passport,
 * calling `onLanded` once it is in. It hands back the animations it starts, so the next moment can
 * cut them short.
 */
const playStampMoment = (
	element: HTMLElement,
	{ hold, travel: [across, down] }: Path,
	onLanded: () => void,
): readonly Animation[] => {
	const thud = element.animate(THUD_FRAMES, {
		duration: THUD_MS,
		easing: "cubic-bezier(0.3, 0.7, 0.4, 1)",
		fill: "forwards",
	});
	const flight = element.animate(
		[
			{ opacity: 1, transform: "translate(0, 0) scale(1)" },
			{ opacity: 0.2, transform: `translate(${String(across)}px, ${String(down)}px) scale(0.12)` },
		],
		{
			delay: THUD_MS + hold,
			duration: FLIGHT_MS,
			easing: "cubic-bezier(0.55, 0, 0.75, 0.2)",
			fill: "forwards",
		},
	);
	thud.finished.then(vibrate).catch(ignoreCancellation);
	flight.finished.then(onLanded).catch(ignoreCancellation);
	return [thud, flight];
};

/** What `useStampFlight` plays a moment on, and what it tells when the moment is over. */
export interface StampFlight {
	/** The stamp that comes down and flies off. */
	readonly stamp: RefObject<HTMLElement | null>;
	/** What it flies into: the passport button. */
	readonly target: RefObject<HTMLElement | null>;
	/** The moment playing, if one is; each new one starts it again. */
	readonly id: number | undefined;
	readonly onDone: (id: number) => void;
	/** How long it sits to be read before it flies, in milliseconds, if not a stamp's usual time. */
	readonly hold?: number;
}

/**
 * Plays a stamp moment: the stamp comes down onto the page with a thud, sits there to be read,
 * then flies into the passport button, which swells as it arrives. Each new moment cuts short any
 * still playing. A reader who has asked for less motion gets none of it: the moment ends as soon
 * as it starts.
 */
export const useStampFlight = ({
	hold = HOLD_MS,
	id,
	onDone,
	stamp,
	target,
}: StampFlight): void => {
	useEffect(() => {
		const element = stamp.current;
		let animations: readonly Animation[] = [];
		if (element !== null && id !== undefined) {
			const landed = (): void => {
				target.current?.animate(PULSE_FRAMES, { duration: PULSE_MS, easing: "ease-out" });
				onDone(id);
			};
			animations = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
				? []
				: playStampMoment(
						element,
						{
							hold,
							travel: travelBetween(
								element.getBoundingClientRect(),
								target.current?.getBoundingClientRect(),
							),
						},
						landed,
					);
			if (animations.length === 0) {
				onDone(id);
			}
		}
		return (): void => {
			for (const animation of animations) {
				animation.cancel();
			}
		};
	}, [hold, id, onDone, stamp, target]);
};
