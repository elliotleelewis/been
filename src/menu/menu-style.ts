import type { CSSProperties } from "react";

import type { MenuSize } from "./types.ts";

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
export interface MenuStyle extends CSSProperties {
	readonly "--menu-height": string;
	readonly "--menu-width": string;
}

/**
 * The style that sizes the page's grid for a drawer of `size`. The app and its loading screen are
 * sized by it alike, so the page the build renders and the app that takes it over agree exactly.
 */
export const menuStyleOf = ({ height, width }: MenuSize): MenuStyle => ({
	"--menu-height": percent(height),
	"--menu-width": percent(width),
});
