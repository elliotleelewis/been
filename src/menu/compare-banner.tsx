import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { openedShareValueAtom, viewingSharedMapAtom } from "../core/location.ts";
import { visitsAtom } from "../core/selection.ts";
import { shareHashOf } from "../core/share-link.ts";
import { m } from "../paraglide/messages.js";

/**
 * Offers the way back to the last shared map the reader opened, once they have left it and have a
 * map of their own to set against it: someone sent them a link, they started their own map, and
 * now they can see how the two compare. It is not there the rest of the time.
 */
export const CompareBanner: FC = memo(() => {
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);
	const opened = useAtomValue(openedShareValueAtom);
	const hasOwnMap = Object.keys(useAtomValue(visitsAtom)).length > 0;

	if (viewingSharedMap || opened === null || !hasOwnMap) {
		return null;
	}

	return (
		<div className="flex shrink-0 items-center justify-between gap-3 bg-primary/15 px-4 py-2 text-sm dark:bg-primary/20">
			<p>{m.menu_compare_prompt()}</p>
			{/* Going to compare is a navigation of its own, so going back returns to the reader's map. */}
			<Link
				to="/"
				hash={shareHashOf(opened)}
				className="shrink-0 rounded-full bg-primary px-3 py-1 font-medium text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:bg-primary dark:text-white"
			>
				{m.menu_compare_open()}
			</Link>
		</div>
	);
});
CompareBanner.displayName = "CompareBanner";
