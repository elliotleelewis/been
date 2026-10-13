import { useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import type { Country } from "../core/types.ts";
import { MenuItem } from "./menu-item.tsx";
import { searchAtom } from "./search.ts";

interface Props {
	/** The search as it was compared, which is what the message quotes back. */
	readonly query: string;
	/** Countries a typo or two away from the search, offered as the ones that might have been meant. */
	readonly suggestions: readonly Country[];
}

/**
 * What the list shows when a search finds nothing: the near misses, if there are any, ready to be
 * ticked where they stand, and a way back to the whole list.
 */
export const MenuNoResults: FC<Props> = memo(({ query, suggestions }) => {
	const setSearch = useSetAtom(searchAtom);
	const clearSearch = useCallback(() => {
		setSearch("");
	}, [setSearch]);

	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			<p className="mx-4 mt-6 mb-2 text-center font-medium">{`No countries match “${query}”.`}</p>
			{suggestions.length === 0 ? null : (
				<>
					<h2 className="px-4 py-2 font-medium text-xs text-zinc-600 uppercase tracking-wide dark:text-zinc-400">
						{"Did you mean"}
					</h2>
					<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{suggestions.map((country) => (
							<MenuItem key={country.iso3166} country={country} />
						))}
					</ul>
				</>
			)}
			<div className="m-4 flex justify-center">
				<button
					type="button"
					className="rounded-full px-4 py-1.5 font-medium text-primary text-sm hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-zinc-800"
					onClick={clearSearch}
				>
					{"Clear search"}
				</button>
			</div>
		</div>
	);
});
MenuNoResults.displayName = "MenuNoResults";
