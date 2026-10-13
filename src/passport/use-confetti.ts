import { useEffect } from "react";
import type { RefObject } from "react";

import type { ConfettiPiece } from "./confetti.ts";

/** How long a piece of confetti flies, from the burst to the end of its fall, in milliseconds. */
const CONFETTI_MS = 1700;

/** The keyframes of one piece: thrown out from the middle, then falling away as it fades. */
const framesOf = ({ burst: [across, down], fall, spin }: ConfettiPiece): Keyframe[] => [
	{ opacity: 0, transform: "translate(0, 0) scale(0.3) rotate(0deg)" },
	{ offset: 0.08, opacity: 1 },
	{
		offset: 0.35,
		opacity: 1,
		transform: `translate(${String(across)}px, ${String(down)}px) scale(1) rotate(${String(spin / 3)}deg)`,
	},
	{
		opacity: 0,
		transform: `translate(${String(across * 1.15)}px, ${String(down + fall)}px) scale(0.9) rotate(${String(spin)}deg)`,
	},
];

/**
 * Throws the confetti in `container` each time a new moment `id` starts, one piece to each child,
 * as `pieces` describes them. A reader who has asked for less motion gets none of it.
 */
export const useConfetti = (
	container: RefObject<HTMLElement | null>,
	pieces: readonly ConfettiPiece[],
	id: number | undefined,
): void => {
	useEffect(() => {
		const element = container.current;
		const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const animations =
			element === null || id === undefined || reduced
				? []
				: pieces.flatMap((piece, index) => {
						const child = element.children.item(index);
						return child === null
							? []
							: [
									child.animate(framesOf(piece), {
										delay: piece.delay,
										duration: CONFETTI_MS,
										easing: "cubic-bezier(0.2, 0.6, 0.4, 1)",
										fill: "forwards",
									}),
								];
					});
		return (): void => {
			for (const animation of animations) {
				animation.cancel();
			}
		};
	}, [container, id, pieces]);
};
