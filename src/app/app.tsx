import { useAtomValue } from "jotai";
import { memo, useId, useMemo } from "react";
import type { CSSProperties, FC } from "react";

import { Globe } from "../globe/globe.tsx";
import { TapToastRegion } from "../globe/tap-toast-region.tsx";
import { MenuPanel } from "../menu/menu-panel.tsx";
import { MenuResizer } from "../menu/menu-resizer.tsx";
import { menuSizeAtom } from "../menu/size.ts";
import { Header } from "./header.tsx";
import {
	APP_GRID_CLASS_NAME,
	GLOBE_AREA_CLASS_NAME,
	MENU_AREA_CLASS_NAME,
	MENU_CONTENT_CLASS_NAME,
} from "./types.ts";

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

	const style = useMemo(
		(): MenuStyle => ({
			"--menu-height": percent(menuSize.height),
			"--menu-width": percent(menuSize.width),
		}),
		[menuSize],
	);

	return (
		<div className={APP_GRID_CLASS_NAME} style={style}>
			<Header />
			<div id={menuId} className={MENU_AREA_CLASS_NAME}>
				<div className={MENU_CONTENT_CLASS_NAME}>
					<MenuPanel />
				</div>
				<MenuResizer controls={menuId} />
			</div>
			<div className={GLOBE_AREA_CLASS_NAME}>
				<Globe />
				<TapToastRegion />
			</div>
		</div>
	);
});
App.displayName = "App";
