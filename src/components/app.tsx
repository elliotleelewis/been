import { useAtomValue, useSetAtom } from "jotai";
import { memo, useEffect, useId, useMemo, useState } from "react";
import type { CSSProperties, FC } from "react";

import type { Country } from "../models/country";
import { menuSizeAtom, rawCountriesAtom } from "../state/atoms.ts";
import { Globe } from "./globe";
import { Menu } from "./menu";
import { MenuError } from "./menu-error";
import { MenuResizer } from "./menu-resizer";

const PERCENT = 100;
const PERCENT_PRECISION = 2;

// A fraction of the viewport as the percentage a grid track can be sized by, rounded to keep a
// third of the screen from reaching CSS as seventeen digits.
const percent = (fraction: number): string =>
	`${Number((fraction * PERCENT).toFixed(PERCENT_PRECISION))}%`;

// React Compiler cannot lower an import expression, so the dynamic import that keeps the country
// list out of the main bundle sits at module scope rather than inside the effect that calls it.
const loadCountries = async (): Promise<readonly Country[]> => {
	const { countries } = await import("../data/countries");
	return countries;
};

// `CSSProperties` has no room for custom properties, and the drawer's size reaches the layout as
// two of them: the grid tracks the drawer sits in are what read it.
interface MenuStyle extends CSSProperties {
	readonly "--menu-height": string;
	readonly "--menu-width": string;
}

export const App: FC = memo(() => {
	const setRawCountries = useSetAtom(rawCountriesAtom);
	const menuSize = useAtomValue(menuSizeAtom);
	const menuId = useId();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>();

	useEffect(() => {
		loadCountries()
			.then((countries) => {
				const countryMap = Object.fromEntries(
					countries.map((country) => [country.iso3166, country]),
				);
				setRawCountries(countryMap);
				setLoading(false);
			})
			.catch((cause: unknown) => {
				setError(cause instanceof Error ? cause : new Error("Failed to load countries", { cause }));
			});
	}, [setRawCountries]);

	const style = useMemo(
		(): MenuStyle => ({
			"--menu-height": percent(menuSize.height),
			"--menu-width": percent(menuSize.width),
		}),
		[menuSize],
	);

	return (
		<div
			className="grid size-full grid-rows-[auto_minmax(0,1fr)_min(var(--menu-height),calc(100%_-_var(--spacing-header)))] md:grid-cols-[var(--menu-width)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] dark:bg-zinc-900 dark:text-white"
			style={style}
		>
			<div className="flex h-header items-center justify-center bg-primary text-white md:col-start-1 dark:bg-zinc-950 dark:text-primary">
				<h1 className="select-none font-bold text-xl tracking-wide">{"been"}</h1>
			</div>
			<div
				id={menuId}
				className="z-10 row-start-3 flex min-h-0 flex-col-reverse overflow-hidden md:col-start-1 md:row-start-2 md:flex-row dark:bg-zinc-900 dark:text-white"
			>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">
					{error ? <MenuError /> : <Menu loading={loading} />}
				</div>
				<MenuResizer controls={menuId} />
			</div>
			<div className="row-start-2 md:col-start-2 md:row-span-2 md:row-start-1">
				<Globe />
			</div>
		</div>
	);
});
App.displayName = "App";
