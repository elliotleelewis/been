import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC, RefObject } from "react";

import { stampMomentAtom } from "../core/ticking.ts";
import { landStampAtom } from "./moments.ts";
import { Stamp } from "./stamp.tsx";
import { passportStampsAtom } from "./stamps.ts";
import { useStampFlight } from "./use-stamp-flight.ts";

interface Props {
	/** What the stamp flies into once it has landed: the passport button. */
	readonly target: RefObject<HTMLElement | null>;
}

/**
 * The stamp moment: when the reader ticks a country, its stamp comes down on a scrap of passport
 * paper in the middle of the screen, then flies into the passport. It is decoration only, hidden
 * from assistive technology, which hears about the tick from the checkbox or the tap toast.
 */
export const StampMoment: FC<Props> = memo(({ target }) => {
	const moment = useAtomValue(stampMomentAtom);
	const stamps = useAtomValue(passportStampsAtom);
	const landStamp = useSetAtom(landStampAtom);
	const ref = useRef<HTMLDivElement>(null);
	const end = useCallback(
		(id: number) => {
			landStamp(id);
		},
		[landStamp],
	);
	useStampFlight({ id: moment?.id, onDone: end, stamp: ref, target });

	const stamp = stamps.find(({ country }) => country.iso3166 === moment?.code);
	return moment === null || stamp === undefined ? null : (
		<div
			className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
			aria-hidden="true"
		>
			<div
				key={moment.id}
				ref={ref}
				className="size-44 rounded-2xl bg-[#f3eddc] p-3 opacity-0 shadow-2xl dark:bg-[#ece4cf]"
			>
				<Stamp stamp={stamp} />
			</div>
		</div>
	);
});
StampMoment.displayName = "StampMoment";
