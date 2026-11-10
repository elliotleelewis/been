import { memo } from "react";
import type { FC } from "react";

/**
 * The globe as it opens, before MapLibre has drawn it: a disc of ocean the size and place of the
 * sphere it will draw, from `.globe-backdrop` in `src/styles.css`. The page's loading screen shows it,
 * and it stays behind the map, which covers it exactly once it has drawn, so nothing changes size
 * or colour as the map comes in. It is a picture only.
 */
export const GlobeBackdrop: FC = memo(() => (
	<div
		className="globe-backdrop pointer-events-none absolute inset-0 overflow-hidden"
		aria-hidden="true"
	>
		<div className="globe-backdrop-sphere rounded-full bg-[#d4dadc] dark:bg-[#2c353c]" />
	</div>
));
GlobeBackdrop.displayName = "GlobeBackdrop";
