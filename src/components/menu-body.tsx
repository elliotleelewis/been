import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import type { Continent } from "../models/region";
import { expandedRegionsAtom } from "../state/regions";
import { MenuContinent } from "./menu-continent";

interface Props {
	readonly continents: readonly Continent[];
	readonly loading: boolean;
	// Whether the list is narrowed by a search, which opens every continent with a match in it, as
	// a match hidden inside a closed continent would read as no match at all.
	readonly searching: boolean;
}

export const MenuBody: FC<Props> = memo(({ continents, loading, searching }) => {
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
					<title>{"Loading!"}</title>
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

	if (continents.length === 0) {
		return <div className="m-4 text-center font-medium">{"No results!"}</div>;
	}

	return (
		<ul className="min-h-0 flex-1 overscroll-contain overflow-y-auto">
			{continents.map((continent) => (
				<MenuContinent
					key={continent.code}
					continent={continent}
					expanded={searching || expandedRegions.includes(continent.code)}
				/>
			))}
		</ul>
	);
});
MenuBody.displayName = "MenuBody";
