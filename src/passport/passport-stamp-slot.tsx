import { memo, useCallback } from "react";
import type { FC } from "react";

import type { Country } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { StampPicture } from "./stamp-picture.tsx";
import type { PassportStamp } from "./types.ts";

interface Props {
	readonly stamp: PassportStamp;
	/** Frames the stamp's country on the globe. */
	readonly onShow: (country: Country) => void;
}

/**
 * How many pixels one hundredth of the passport's width is at its narrowest, the width a stamp's
 * offset is measured at, so that it scales with the passport.
 */
const PX_PER_CQW = 2.88;

/**
 * One stamp's place on a page, nudged off it by the stamp's design, which shows its country. Once
 * drawn, the stamp is shown as a picture of itself, so the page stays cheap to redraw as it tilts.
 */
export const PassportStampSlot: FC<Props> = memo(({ onShow, stamp }) => {
	const show = useCallback(() => {
		onShow(stamp.country);
	}, [onShow, stamp.country]);
	const [across, down] = stamp.design.offset;
	const label =
		stamp.date === undefined
			? m.passport_stamp_undated({ country: stamp.country.name })
			: m.passport_stamp_dated({ country: stamp.country.name, date: stamp.date });

	return (
		<li className="flex items-center justify-center">
			<button
				type="button"
				className="size-full max-h-[44.4cqw] max-w-[44.4cqw] rounded-full mix-blend-multiply transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
				style={{ translate: `${String(across / PX_PER_CQW)}cqw ${String(down / PX_PER_CQW)}cqw` }}
				onClick={show}
				aria-label={label}
			>
				{/* Keyed by what can change on a stamp once it is on a page, so it is pictured afresh. */}
				<StampPicture
					key={`${stamp.date ?? ""}:${stamp.silhouette === undefined ? "" : "outlined"}`}
					stamp={stamp}
				/>
			</button>
		</li>
	);
});
PassportStampSlot.displayName = "PassportStampSlot";
