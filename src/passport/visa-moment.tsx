import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC, RefObject } from "react";

import { confettiOf } from "./confetti.ts";
import { endVisaMomentAtom, shownVisaMomentAtom } from "./moments.ts";
import { useConfetti } from "./use-confetti.ts";
import { useStampFlight } from "./use-stamp-flight.ts";
import { Visa } from "./visa.tsx";
import { visasAtom } from "./visas.ts";

interface Props {
	/** What the visas fly into once they have been read: the passport button. */
	readonly target: RefObject<HTMLElement | null>;
}

/** How long the visas sit to be read before they fly, longer than a stamp, as there is more on one. */
const HOLD_MS = 1600;
const CONFETTI = confettiOf(28);

/**
 * The visa moment: when a tick earns an achievement, once its stamp has landed, the visa for it is
 * stuck on in the middle of the screen in a burst of confetti made of tiny stamps, then flies into
 * the passport, with any others it earned at the same time stacked behind it. It is decoration
 * only, hidden from assistive technology, as the stamp moment is.
 */
export const VisaMoment: FC<Props> = memo(({ target }) => {
	const moment = useAtomValue(shownVisaMomentAtom);
	const visas = useAtomValue(visasAtom);
	const endVisaMoment = useSetAtom(endVisaMomentAtom);
	const ref = useRef<HTMLDivElement>(null);
	const confetti = useRef<HTMLDivElement>(null);
	const end = useCallback(
		(id: number) => {
			endVisaMoment(id);
		},
		[endVisaMoment],
	);
	useStampFlight({ hold: HOLD_MS, id: moment?.id, onDone: end, stamp: ref, target });
	useConfetti(confetti, CONFETTI, moment?.id);

	const earned = visas.filter(({ achievement }) => moment?.ids.includes(achievement.id) === true);
	return moment === null || earned.length === 0 ? null : (
		<div
			className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
			aria-hidden="true"
		>
			<div ref={confetti} className="absolute inset-0 flex items-center justify-center">
				{CONFETTI.map((piece) => (
					<span
						key={`${String(piece.burst[0])}:${String(piece.burst[1])}`}
						className="absolute border-2 opacity-0"
						style={{
							borderColor: piece.ink,
							borderRadius: piece.round ? "9999px" : "2px",
							height: piece.size,
							width: piece.size,
						}}
					/>
				))}
			</div>
			<div key={moment.id} ref={ref} className="grid w-72 max-w-[85vw] opacity-0">
				{earned.toReversed().map((visa, index) => (
					<div
						key={visa.achievement.id}
						className="[grid-area:1/1]"
						style={{
							transform: `translate(${String((earned.length - 1 - index) * 10)}px, ${String((earned.length - 1 - index) * 10)}px)`,
						}}
					>
						<Visa visa={visa} />
					</div>
				))}
			</div>
		</div>
	);
});
VisaMoment.displayName = "VisaMoment";
