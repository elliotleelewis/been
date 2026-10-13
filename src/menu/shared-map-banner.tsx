import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { countryCodesAtom } from "../core/dataset.ts";
import { leaveSharedMapAtom, viewingSharedMapAtom } from "../core/location.ts";
import { selectedCountriesAtom } from "../core/selection.ts";

/**
 * Says the map on show is someone else's, opened from a share link, and offers the way back to the
 * reader's own. It is not there the rest of the time.
 */
export const SharedMapBanner: FC = memo(() => {
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);
	const { length: count } = useAtomValue(selectedCountriesAtom);
	// The map a link carries can only be read once the country list is in, so until then there is
	// no count to give.
	const { length: loaded } = useAtomValue(countryCodesAtom);
	const leaveSharedMap = useSetAtom(leaveSharedMapAtom);
	const leave = useCallback(() => {
		leaveSharedMap();
	}, [leaveSharedMap]);

	if (!viewingSharedMap) {
		return null;
	}

	return (
		<div className="flex shrink-0 items-center justify-between gap-3 bg-primary/15 px-4 py-2 text-sm dark:bg-primary/20">
			<p>
				<span className="font-medium">{"Viewing a shared map"}</span>
				{loaded === 0 ? null : ` · ${String(count)} ${count === 1 ? "country" : "countries"}`}
			</p>
			<button
				type="button"
				className="shrink-0 rounded-full px-3 py-1 font-medium text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-primary/20"
				onClick={leave}
			>
				{"Back to my map"}
			</button>
		</div>
	);
});
SharedMapBanner.displayName = "SharedMapBanner";
