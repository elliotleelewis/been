import { useAtomValue } from "jotai";
import { memo, useCallback } from "react";
import type { FC, ReactNode } from "react";

import type { AchievementTier } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import type { Visa as VisaModel } from "./types.ts";
import { VisaBack } from "./visa-back.tsx";
import { visaBacksAtom } from "./visa-backs.ts";
import { VisaFace } from "./visa-face.tsx";
import { VisaTurn } from "./visa-turn.tsx";
import type { VisaTurnBack } from "./visa-turn.tsx";
import { heldVisaIdsAtom } from "./visas.ts";

/** What a rare visa's tier is called, after what it is for, to someone who can't see its foil. */
const TIER_LABELS: Readonly<Partial<Record<AchievementTier, () => string>>> = {
	foil: m.passport_visa_foil,
	legendary: m.passport_visa_legendary,
};

interface Props {
	readonly visa: VisaModel;
}

/**
 * A visa the map has earned, which turns over to show the countries that earned it. On a shared map
 * set against the reader's own, one the reader holds too is marked so.
 */
export const VisaCard: FC<Props> = memo(({ visa }) => {
	const { achievement, date } = visa;
	const back = useAtomValue(visaBacksAtom).get(achievement.id);
	const held = useAtomValue(heldVisaIdsAtom).has(achievement.id);
	const renderBack = useCallback(
		({ buttonRef, id, onFlipBack, shown }: VisaTurnBack): ReactNode =>
			back === undefined ? null : (
				<VisaBack
					id={id}
					visa={visa}
					back={back}
					shown={shown}
					buttonRef={buttonRef}
					onFlipBack={onFlipBack}
				/>
			),
		[back, visa],
	);

	return (
		<VisaTurn
			id={achievement.id}
			renderBack={back === undefined ? undefined : renderBack}
			front={
				<>
					<VisaFace visa={visa} held={held} />
					<span className="sr-only">
						{date === undefined
							? m.passport_visa_undated(achievement)
							: m.passport_visa_dated({ ...achievement, date })}
						{TIER_LABELS[achievement.tier]?.()}
						{held ? m.passport_visa_held_too() : null}
					</span>
				</>
			}
		/>
	);
});
VisaCard.displayName = "VisaCard";
