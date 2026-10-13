import { useAtomValue } from "jotai";
import { memo, useId, useMemo } from "react";
import type { CSSProperties, FC } from "react";

import { Globe } from "../globe/globe.tsx";
import { TapToastRegion } from "../globe/tap-toast-region.tsx";
import { MenuError } from "../menu/menu-error.tsx";
import { MenuResizer } from "../menu/menu-resizer.tsx";
import { Menu } from "../menu/menu.tsx";
import { menuSizeAtom } from "../menu/size.ts";
import { useCountries } from "../menu/use-countries.ts";
import { Header } from "./header.tsx";

const PERCENT = 100;
const PERCENT_PRECISION = 2;

/**
 * A fraction of the viewport as the percentage a grid track can be sized by, rounded to keep a
 * third of the screen from reaching CSS as seventeen digits.
 */
const percent = (fraction: number): string =>
	`${Number((fraction * PERCENT).toFixed(PERCENT_PRECISION))}%`;

/**
 * `CSSProperties` has no room for custom properties, and the drawer's size reaches the layout as
 * two of them: the grid tracks the drawer sits in are what read it.
 */
interface MenuStyle extends CSSProperties {
	readonly "--menu-height": string;
	readonly "--menu-width": string;
}

export const App: FC = memo(() => {
	const menuSize = useAtomValue(menuSizeAtom);
	const menuId = useId();
	const { error, loading } = useCountries();

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
			<Header />
			<div
				id={menuId}
				className="z-10 row-start-3 flex min-h-0 flex-col-reverse overflow-hidden md:col-start-1 md:row-start-2 md:flex-row dark:bg-zinc-900 dark:text-white"
			>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">
					{error ? <MenuError /> : <Menu loading={loading} />}
				</div>
				<MenuResizer controls={menuId} />
			</div>
			<div className="relative row-start-2 md:col-start-2 md:row-span-2 md:row-start-1">
				<Globe />
				<TapToastRegion />
			</div>
		</div>
	);
});
App.displayName = "App";
