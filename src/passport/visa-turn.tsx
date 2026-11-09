import classNames from "classnames";
import { useAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { FC, ReactNode, RefObject } from "react";

import { useFlipFocus } from "./use-flip-focus.ts";
import { flippedVisaAtom } from "./visa-backs.ts";

/** What the back of a visa is handed to draw itself with. */
export interface VisaTurnBack {
	/** Given to the back's root, so the button that turns the visa over can say what it shows. */
	readonly id: string;
	/** Whether the back is the side on show. */
	readonly shown: boolean;
	/** The button that turns the visa back over, which takes focus when the back comes round. */
	readonly buttonRef: RefObject<HTMLButtonElement | null>;
	/** Turns the visa back over to its front. */
	readonly onFlipBack: () => void;
}

interface Props {
	/** The visa's achievement's id, which says which visa is turned over. */
	readonly id: string;
	/** What is on its front, inside the button that turns it over. */
	readonly front: ReactNode;
	/** Draws its back, or is missing where it has none, and the front does not turn. */
	readonly renderBack: ((back: VisaTurnBack) => ReactNode) | undefined;
}

/**
 * A visa on a page of the passport, which turns over when tapped to show its back, and back again
 * from a button on its back. Only one visa is turned over at a time. Under reduced motion it fades
 * from one side to the other rather than turning. Focus follows the side on show.
 */
export const VisaTurn: FC<Props> = memo(({ front, id, renderBack }) => {
	const [flippedVisa, setFlippedVisa] = useAtom(flippedVisaAtom);
	const flipped = flippedVisa === id && renderBack !== undefined;
	const backId = useId();
	const { back: backButton, card, front: frontButton } = useFlipFocus(flipped);

	const flip = useCallback(() => {
		setFlippedVisa(id);
	}, [id, setFlippedVisa]);
	const flipBack = useCallback(() => {
		setFlippedVisa(null);
	}, [setFlippedVisa]);

	return (
		<div ref={card} className="@container relative aspect-[300/190] w-full perspective-[1000px]">
			<div
				className={classNames(
					"relative size-full transform-3d motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out",
					{ "motion-safe:rotate-y-180": flipped },
				)}
			>
				<button
					ref={frontButton}
					type="button"
					className={classNames(
						"absolute inset-0 cursor-pointer rounded-[2cqw] backface-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none motion-safe:transition-transform motion-safe:hover:scale-[1.02] motion-reduce:transition-opacity motion-reduce:duration-300",
						{ "pointer-events-none motion-reduce:opacity-0": flipped },
					)}
					onClick={flip}
					aria-expanded={flipped}
					aria-controls={renderBack === undefined ? undefined : backId}
					inert={flipped}
				>
					{front}
				</button>
				{renderBack?.({ buttonRef: backButton, id: backId, onFlipBack: flipBack, shown: flipped })}
			</div>
		</div>
	);
});
VisaTurn.displayName = "VisaTurn";
