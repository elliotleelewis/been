import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/** The elements of a card with two sides that focus moves between as it turns over. */
interface FlipFocus {
	/** The whole card, both sides. */
	readonly card: RefObject<HTMLDivElement | null>;
	/** What takes focus when the front comes round. */
	readonly front: RefObject<HTMLButtonElement | null>;
	/** What takes focus when the back comes round. */
	readonly back: RefObject<HTMLButtonElement | null>;
}

/**
 * Moves focus to whichever side of a card has just come round, so the reader is never left on the
 * side that has gone. A card turned back because another was turned over keeps its hands off focus,
 * unless focus was on it, as the reader is somewhere else.
 */
export const useFlipFocus = (flipped: boolean): FlipFocus => {
	const card = useRef<HTMLDivElement>(null);
	const front = useRef<HTMLButtonElement>(null);
	const back = useRef<HTMLButtonElement>(null);
	const wasFlipped = useRef(flipped);

	useEffect(() => {
		if (wasFlipped.current === flipped) {
			return;
		}
		wasFlipped.current = flipped;
		if (flipped || card.current?.contains(globalThis.document.activeElement) === true) {
			(flipped ? back : front).current?.focus({ preventScroll: true });
		}
	}, [flipped]);

	return { back, card, front };
};
