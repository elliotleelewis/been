// How big the drawer is on each axis, as a fraction of the viewport. It is a column beside the
// globe on wide screens and a sheet below it on narrow ones, so the two axes are kept apart:
// rotating a phone or moving a window across a breakpoint should find the size that was chosen
// for that shape, not the one chosen for the other. Fractions rather than pixels so a drawer
// keeps its proportions when the window it was sized in is resized.
export interface MenuSize {
	readonly height: number;
	readonly width: number;
}

export interface MenuBounds {
	readonly max: number;
	readonly min: number;
}

// How far the drawer may be dragged. The lower bounds keep enough of the list on screen to be
// worth reading; the upper bound on width keeps the globe from being squeezed out, while a sheet
// is allowed to cover it entirely, because "show me the whole list" is a state worth having.
export const MENU_SIZE_BOUNDS: Readonly<Record<keyof MenuSize, MenuBounds>> = {
	height: { max: 1, min: 0.2 },
	width: { max: 0.6, min: 0.2 },
};

export const MENU_SIZE_DEFAULT: MenuSize = { height: 0.4, width: 1 / 3 };
