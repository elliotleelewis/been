import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { MenuContinent } from "./menu-continent.tsx";
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
		return (
			<div className="flex flex-1 items-center justify-center">
				<svg
					className="size-5 animate-spin text-neutral-800 dark:text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<title>{m.menu_loading()}</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
		);
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
		<ul className="min-h-0 flex-1 overscroll-contain overflow-y-auto">
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
			<MenuSmallPrint />
		</ul>
	);
});
MenuBody.displayName = "MenuBody";
