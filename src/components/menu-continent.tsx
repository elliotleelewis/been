import { useSetAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { FC } from "react";

import type { Continent } from "../models/region";
import { toggleRegionAtom } from "../state/regions";
import { MenuItem } from "./menu-item";
import { Progress } from "./progress";

interface Props {
	readonly continent: Continent;
	readonly expanded: boolean;
}

export const MenuContinent: FC<Props> = memo(({ continent, expanded }) => {
	const toggleRegion = useSetAtom(toggleRegionAtom);
	const contentId = useId();

	const toggle = useCallback(() => {
		toggleRegion(continent.code);
	}, [continent.code, toggleRegion]);

	return (
		<li>
			{/* `top-14` below is this heading's height, so each sub-region's heading sticks under it. */}
			<h2 className="sticky top-0 z-10">
				<button
					type="button"
					className="flex h-14 w-full items-center gap-3 bg-zinc-200 px-4 text-start font-medium hover:bg-zinc-300 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none focus-visible:ring-inset dark:bg-zinc-800 dark:hover:bg-zinc-700"
					aria-expanded={expanded}
					aria-controls={contentId}
					onClick={toggle}
				>
					<svg
						className={`size-4 shrink-0 motion-safe:transition-transform ${expanded ? "rotate-90" : ""}`}
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
					</svg>
					<span className="flex-1">{continent.name}</span>
					<span className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
						{`${String(continent.visited)}/${String(continent.total)}`}
					</span>
					<Progress complete={continent.visited / continent.total} />
				</button>
			</h2>
			<ul id={contentId} hidden={!expanded}>
				{continent.values.map((region) => (
					<li key={region.name}>
						<div className="sticky top-14 flex items-center justify-between bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-600 uppercase tracking-wide dark:bg-zinc-900 dark:text-zinc-400">
							<h3>{region.name}</h3>
							<Progress complete={region.complete ?? 0} />
						</div>
						<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{region.values.map((country) => (
								<MenuItem key={country.iso3166} country={country} />
							))}
						</ul>
					</li>
				))}
			</ul>
		</li>
	);
});
MenuContinent.displayName = "MenuContinent";
