import { useAtom, useAtomValue } from "jotai";
import { memo, useCallback, useId } from "react";
import type { FC } from "react";

import type { AchievementTier } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import type { Visa as VisaModel } from "./types.ts";
import { useFlipFocus } from "./use-flip-focus.ts";
import { VisaBack } from "./visa-back.tsx";
import { flippedVisaAtom, visaBacksAtom } from "./visa-backs.ts";
import { VisaFace } from "./visa-face.tsx";

/** What a rare visa's tier is called, after what it is for, to someone who can't see its foil. */
const TIER_LABELS: Readonly<Partial<Record<AchievementTier, () => string>>> = {
	foil: m.passport_visa_foil,
	legendary: m.passport_visa_legendary,
};

interface Props {
	readonly visa: VisaModel;
}

/**
 * A visa on a page of the passport, which turns over when tapped to show the countries that earned
 * it, and back again from a button on its back. Only one visa is turned over at a time. Under
 * reduced motion it fades from one side to the other rather than turning. Focus follows the side on
 * show.
 */
export const VisaCard: FC<Props> = memo(({ visa }) => {
	const { achievement, date } = visa;
	const [flippedVisa, setFlippedVisa] = useAtom(flippedVisaAtom);
	const back = useAtomValue(visaBacksAtom).get(achievement.id);
	const flipped = flippedVisa === achievement.id && back !== undefined;
	const backId = useId();
	const { back: backButton, card, front } = useFlipFocus(flipped);

	const flip = useCallback(() => {
		setFlippedVisa(achievement.id);
	}, [achievement.id, setFlippedVisa]);
	const flipBack = useCallback(() => {
		setFlippedVisa(null);
	}, [setFlippedVisa]);

	return (
		<div ref={card} className="@container relative aspect-[300/190] w-full perspective-[1000px]">
			<div
				className={`relative size-full transform-3d motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out ${flipped ? "motion-safe:rotate-y-180" : ""}`}
			>
				<button
					ref={front}
					type="button"
					className={`absolute inset-0 cursor-pointer rounded-[2cqw] backface-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none motion-safe:transition-transform motion-safe:hover:scale-[1.02] motion-reduce:transition-opacity motion-reduce:duration-300 ${flipped ? "pointer-events-none motion-reduce:opacity-0" : ""}`}
					onClick={flip}
					aria-expanded={flipped}
					aria-controls={back === undefined ? undefined : backId}
					inert={flipped}
				>
					<VisaFace visa={visa} />
					<span className="sr-only">
						{date === undefined
							? m.passport_visa_undated(achievement)
							: m.passport_visa_dated({ ...achievement, date })}
						{TIER_LABELS[achievement.tier]?.()}
					</span>
				</button>
				{back === undefined ? null : (
					<VisaBack
						id={backId}
						visa={visa}
						back={back}
						shown={flipped}
						buttonRef={backButton}
						onFlipBack={flipBack}
					/>
				)}
			</div>
		</div>
	);
});
VisaCard.displayName = "VisaCard";
