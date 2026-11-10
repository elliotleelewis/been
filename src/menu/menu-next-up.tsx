import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { viewingSharedMapAtom } from "../core/location.ts";
import { m } from "../paraglide/messages.js";
import { MenuItem } from "./menu-item.tsx";
import { nextUpAtom } from "./next-up.ts";

/**
 * The countries recommended to visit next, above the continents, each ticked like any other in the
 * list, with why it is recommended beneath its name. It is not there until there is something to
 * recommend from. On a shared map set against the reader's own, they are the shared map's countries
 * new to the reader, there to look at rather than tick.
 */
export const MenuNextUp: FC = memo(() => {
	const nextUp = useAtomValue(nextUpAtom);
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);

	return nextUp.length === 0 ? null : (
		<li>
			<h2 className="sticky top-10 z-10 flex h-14 items-center gap-3 bg-[color-mix(in_oklab,var(--color-primary)_10%,var(--color-white))] px-4 font-medium text-zinc-900 dark:bg-[color-mix(in_oklab,var(--color-primary)_15%,var(--color-zinc-900))] dark:text-white">
				<svg
					className="size-4 shrink-0 text-primary"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8 2 9.2h7.6z" />
				</svg>
				{viewingSharedMap ? m.menu_from_their_map() : m.menu_next_up()}
			</h2>
			<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
				{nextUp.map(({ country, why }) => (
					<MenuItem key={country.iso3166} country={country} detail={why} />
				))}
			</ul>
		</li>
	);
});
MenuNextUp.displayName = "MenuNextUp";
