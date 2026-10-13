import { memo, useCallback } from "react";
import type { FC } from "react";

import type { Country } from "../models/country";
import type { PassportStamp } from "../models/passport";
import { Stamp } from "./stamp";

interface Props {
	readonly stamp: PassportStamp;
	/** Frames the stamp's country on the globe. */
	readonly onShow: (country: Country) => void;
}

/** One stamp's place on a page, nudged off it by the stamp's design, which shows its country. */
export const PassportStampSlot: FC<Props> = memo(({ onShow, stamp }) => {
	const show = useCallback(() => {
		onShow(stamp.country);
	}, [onShow, stamp.country]);
	const [across, down] = stamp.design.offset;
	const label =
		stamp.date === undefined ? stamp.country.name : `${stamp.country.name}, ${stamp.date}`;

	return (
		<li className="flex items-center justify-center">
			<button
				type="button"
				className="size-full max-h-32 max-w-32 rounded-full mix-blend-multiply transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
				style={{ translate: `${String(across)}px ${String(down)}px` }}
				onClick={show}
				aria-label={`${label}. Show on the globe`}
			>
				<Stamp stamp={stamp} />
			</button>
		</li>
	);
});
PassportStampSlot.displayName = "PassportStampSlot";
