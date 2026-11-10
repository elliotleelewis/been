import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { countryCodesAtom } from "../core/dataset.ts";
import { leaveSharedMapAtom, viewingSharedMapAtom } from "../core/location.ts";
import { selectedCountriesAtom, visitsAtom } from "../core/selection.ts";
import { m } from "../paraglide/messages.js";
import { SharedMapCompare } from "./shared-map-compare.tsx";

/**
 * Says the map on show is someone else's, opened from a share link, and offers the way back to the
 * reader's own. Once the reader has a map of their own, it sets the two side by side, which they can
 * turn off, and says how they compare. It is not there the rest of the time.
 */
export const SharedMapBanner: FC = memo(() => {
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);
	const { length: count } = useAtomValue(selectedCountriesAtom);
	// The map a link carries can only be read once the country list is in, so until then there is
	// no count to give.
	const { length: loaded } = useAtomValue(countryCodesAtom);
	const hasOwnMap = Object.keys(useAtomValue(visitsAtom)).length > 0;
	const leaveSharedMap = useSetAtom(leaveSharedMapAtom);
	const leave = useCallback(() => {
		leaveSharedMap();
	}, [leaveSharedMap]);

	if (!viewingSharedMap) {
		return null;
	}

	return (
		<div className="flex shrink-0 flex-col gap-2 bg-primary/15 px-4 py-2 text-sm dark:bg-primary/20">
			<div className="flex items-center justify-between gap-3">
				<p>
					<span className="font-medium">{m.menu_shared_map()}</span>
					{loaded === 0 ? null : ` · ${m.menu_shared_map_count({ count })}`}
				</p>
				<button
					type="button"
					className="shrink-0 rounded-full px-3 py-1 font-medium text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-primary/20"
					onClick={leave}
				>
					{hasOwnMap ? m.menu_back_to_my_map() : m.menu_start_my_map()}
				</button>
			</div>
			{hasOwnMap && loaded > 0 ? <SharedMapCompare /> : null}
		</div>
	);
});
SharedMapBanner.displayName = "SharedMapBanner";
