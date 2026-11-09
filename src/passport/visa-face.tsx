import { memo, useMemo, useRef } from "react";
import type { FC } from "react";

import type { Visa as VisaModel } from "./types.ts";
import { useFoil } from "./use-foil.ts";
import { Visa } from "./visa.tsx";

interface Props {
	readonly visa: VisaModel;
	/** Whether the light on a foil visa moves, rather than resting while it can't be seen. */
	readonly lit: boolean;
}

/**
 * The front of a visa as printed, and, for a rare achievement, the foil over it: on its band and
 * medallion, or holographic all over for a legendary one. The foil catches the light where the
 * reader's pointer or device points, and the visa tilts towards it. It is a picture only.
 */
export const VisaFace: FC<Props> = memo(({ lit, visa }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { tier } = visa.achievement;
	useFoil(ref, lit && tier !== "standard");
	// Each layer is turned as the visa is, rather than all of them in one turned wrapper, which would
	// keep their blending to itself and away from the visa beneath.
	const turn = useMemo(
		() => ({ rotate: `${String(visa.design.rotation)}deg` }),
		[visa.design.rotation],
	);

	return (
		<div
			ref={ref}
			className="visa-face relative aspect-[300/190] w-full"
			data-tier={tier}
			aria-hidden="true"
		>
			<Visa visa={visa} />
			{tier === "legendary" ? <div className="visa-foil visa-foil-sheen" style={turn} /> : null}
			{tier === "standard" ? null : <div className="visa-foil visa-foil-ink" style={turn} />}
			{tier === "legendary" ? <div className="visa-foil visa-foil-dots" style={turn} /> : null}
			{tier === "standard" ? null : <div className="visa-foil visa-foil-glare" style={turn} />}
		</div>
	);
});
VisaFace.displayName = "VisaFace";
