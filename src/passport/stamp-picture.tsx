import { memo, useRef } from "react";
import type { FC } from "react";

import { Stamp } from "./stamp.tsx";
import type { PassportStamp } from "./types.ts";
import { useStampSnapshot } from "./use-stamp-snapshot.ts";

interface Props {
	readonly stamp: PassportStamp;
}

/**
 * A stamp shown as a picture of itself once it has been drawn, so a page of them stays cheap to
 * redraw while the passport tilts. Whatever shows it remounts it when the stamp changes.
 */
export const StampPicture: FC<Props> = memo(({ stamp }) => {
	const art = useRef<HTMLSpanElement>(null);
	useStampSnapshot(art);

	return (
		<span ref={art} className="relative block size-full">
			<Stamp stamp={stamp} />
		</span>
	);
});
StampPicture.displayName = "StampPicture";
