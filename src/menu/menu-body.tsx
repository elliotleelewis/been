import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { MenuContinent } from "./menu-continent.tsx";
import { MenuLoading } from "./menu-loading.tsx";
import { MenuNextUp } from "./menu-next-up.tsx";
import { MenuNoResults } from "./menu-no-results.tsx";
import { MenuSmallPrint } from "./menu-small-print.tsx";
import { expandedRegionsAtom } from "./regions.ts";
import type { SearchResults } from "./types.ts";

interface Props {
	readonly loading: boolean;
	readonly results: SearchResults;
}

export const MenuBody: FC<Props> = memo(({ loading, results }) => {
	const expandedRegions = useAtomValue(expandedRegionsAtom);

	if (loading) {
		return <MenuLoading />;
	}

	// Narrowing the list by standing is no search, and finding nothing is no miss to suggest for.
	if (results.continents.length === 0 && results.query === "") {
		return (
			<p className="mx-4 mt-6 mb-2 flex-1 text-center font-medium text-zinc-600 dark:text-zinc-400">
				{m.menu_standing_none()}
			</p>
		);
	}

	if (results.continents.length === 0) {
		return <MenuNoResults query={results.query} suggestions={results.suggestions} />;
	}

	const narrowed = results.query !== "" || results.standing !== null;

	return (
		<ul>
			{narrowed ? null : <MenuNextUp />}
			{results.continents.map((continent) => (
				<MenuContinent
					key={continent.code}
					continent={continent}
					// A search, or narrowing the list, opens every continent with a match in it, as a match
					// hidden inside a closed continent would read as no match at all.
					expanded={narrowed || expandedRegions.includes(continent.code)}
				/>
			))}
			<li>
				<MenuSmallPrint />
			</li>
		</ul>
	);
});
MenuBody.displayName = "MenuBody";
