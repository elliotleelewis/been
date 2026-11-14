import { Link } from "@tanstack/react-router";
import type { ActiveOptions } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { countryCodesAtom } from "../core/dataset.ts";
import { viewingSharedMapAtom } from "../core/location.ts";
import { selectedCountriesAtom, visitsAtom } from "../core/selection.ts";
import { m } from "../paraglide/messages.js";
import { StandingFilter } from "./standing-filter.tsx";

/** Matches a link to the location only with its hash, which is where a shared map is. */
const INCLUDE_HASH: ActiveOptions = { includeHash: true };

/**
 * Says the map on show is someone else's, opened from a share link, and offers the way back to the
 * reader's own. Until the reader has a map of their own, it invites them to start one and come back
 * to compare; once they do, it says how the two compare. It is not there the rest of the time.
 */
export const SharedMapBanner: FC = memo(() => {
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);
	const { length: count } = useAtomValue(selectedCountriesAtom);
	// The map a link carries can only be read once the country list is in, so until then there is
	// no count to give.
	const { length: loaded } = useAtomValue(countryCodesAtom);
	const hasOwnMap = Object.keys(useAtomValue(visitsAtom)).length > 0;

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
				{/* Leaving is a navigation to the map without the link, in place of it, so a reload stays on
				the reader's own map and going back does not return to the shared one. The hash counts
				towards where it leads, or the link would claim to be the page it leaves. */}
				<Link
					to="/"
					replace
					activeOptions={INCLUDE_HASH}
					className="shrink-0 rounded-full px-3 py-1 font-medium text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-primary/20"
				>
					{hasOwnMap ? m.menu_back_to_my_map() : m.menu_start_my_map()}
				</Link>
			</div>
			{hasOwnMap ? (
				<StandingFilter />
			) : (
				<p className="text-zinc-700 dark:text-zinc-300">{m.menu_compare_invite()}</p>
			)}
		</div>
	);
});
SharedMapBanner.displayName = "SharedMapBanner";
