import { memo, useMemo } from "react";
import type { FC } from "react";

import type { Visa as VisaModel } from "./types.ts";
import { VisaHeldMark } from "./visa-held-mark.tsx";
import { Visa } from "./visa.tsx";

interface Props {
	readonly visa: VisaModel;
	/** Whether the reader's own map holds it too, on a shared map set against it, which a mark says. */
	readonly held?: boolean;
}

/**
 * The front of a visa as printed, and, for a rare achievement, the foil over it: on its band and
 * medallion, or holographic all over for a legendary one. The foil catches the light of whatever it
 * lies in, the passport or the visa moment. It is a picture only.
 */
export const VisaFace: FC<Props> = memo(({ held = false, visa }) => {
	const { tier } = visa.achievement;
	// Each layer is turned as the visa is, rather than all of them in one turned wrapper, which would
	// keep their blending to itself and away from the visa beneath.
	const turn = useMemo(
		() => ({ rotate: `${String(visa.design.rotation)}deg` }),
		[visa.design.rotation],
	);

	return (
		<div className="visa-face relative aspect-[300/190] w-full" data-tier={tier} aria-hidden="true">
			<Visa visa={visa} />
			{tier === "legendary" ? <div className="visa-foil visa-foil-sheen" style={turn} /> : null}
			{tier === "standard" ? null : <div className="visa-foil visa-foil-ink" style={turn} />}
			{tier === "legendary" ? <div className="visa-foil visa-foil-dots" style={turn} /> : null}
			{tier === "standard" ? null : <div className="visa-foil visa-foil-glare" style={turn} />}
			{held ? <VisaHeldMark /> : null}
		</div>
	);
});
VisaFace.displayName = "VisaFace";
