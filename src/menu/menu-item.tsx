import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { viewingSharedMapAtom } from "../core/location.ts";
import { pointedCountryAtom, unpointCountryAtom } from "../core/selection.ts";
import { removeCountryAtom, stampCountryAtom } from "../core/ticking.ts";
import type { Country } from "../core/types.ts";
import { StandingBadge } from "./standing-badge.tsx";

interface Props {
	readonly country: Country;
	/** A line beneath the country's name, such as why it is recommended. */
	readonly detail?: string | undefined;
}

export const MenuItem: FC<Props> = memo(({ country, detail }) => {
	const addCountry = useSetAtom(stampCountryAtom);
	const removeCountry = useSetAtom(removeCountryAtom);
	// Someone else's map, opened from a share link, is there to look at, not to change.
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);

	const pointCountry = useSetAtom(pointedCountryAtom);
	const unpointCountry = useSetAtom(unpointCountryAtom);
	const point = useCallback(() => {
		pointCountry(country.iso3166);
	}, [country.iso3166, pointCountry]);
	const unpoint = useCallback(() => {
		unpointCountry(country.iso3166);
	}, [country.iso3166, unpointCountry]);

	const toggleCountry = useCallback(() => {
		if (country.selected === true) {
			removeCountry(country.iso3166);
		} else {
			addCountry(country.iso3166);
		}
	}, [country, addCountry, removeCountry]);

	return (
		<li className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
			{/* Pointing at a country, with the mouse or by moving focus onto it, lights it up on the globe. */}
			<label
				className="flex items-center px-4 py-1"
				onPointerEnter={point}
				onPointerLeave={unpoint}
			>
				<input
					id={country.iso3166}
					className="my-0 me-2 size-4 rounded border-zinc-400 checked:bg-primary focus:ring-2 focus:ring-primary/50 active:ring-primary dark:border-zinc-600 dark:bg-zinc-900"
					type="checkbox"
					checked={country.selected}
					onChange={toggleCountry}
					onFocus={point}
					onBlur={unpoint}
					disabled={viewingSharedMap}
				/>
				{detail === undefined ? (
					<span>{country.name}</span>
				) : (
					<span className="flex flex-col py-0.5">
						<span>{country.name}</span>
						<span className="text-xs text-zinc-500 dark:text-zinc-400">{detail}</span>
					</span>
				)}
				{country.standing === undefined ? null : <StandingBadge standing={country.standing} />}
			</label>
		</li>
	);
});
MenuItem.displayName = "MenuItem";
