import { memo } from "react";
import type { FC } from "react";

import type { CountryHover } from "./use-country-pointer.ts";

interface Props {
	readonly hover: CountryHover;
}

/** Names the country under the mouse, just above the pointer so the pointer does not cover it. */
export const GlobeLabel: FC<Props> = memo(({ hover }) => (
	<div
		className="-translate-x-1/2 -translate-y-[calc(100%+0.75rem)] pointer-events-none absolute z-10 rounded-sm bg-white px-2 py-1 font-medium text-sm text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-white"
		style={{ left: hover.left, top: hover.top }}
	>
		{hover.name}
	</div>
));
GlobeLabel.displayName = "GlobeLabel";
