import { useAtom } from "jotai";
import { useCallback, useRef } from "react";
import { useMove } from "react-aria";
import type { MoveMoveEvent, MoveResult } from "react-aria";

import { MENU_SIZE_BOUNDS } from "../models/menu";
import { menuSizeAtom } from "../state/atoms.ts";
import { useMatchMedia } from "./use-match-media";
import { useWindow } from "./use-window";

// Tailwind's `md`, which is the breakpoint the drawer changes shape at. Where it sits is CSS's
// business, but which axis the handle drags along only exists here.
const WIDE_SCREEN_QUERY = "(min-width: 48rem)";

// How far one arrow key press moves the handle, in pixels. `useMove` reports a key press as a one
// pixel move, which is a truthful delta and a useless step.
const KEYBOARD_STEP = 24;

const PERCENT = 100;

export interface MenuResize {
	// The separator's own orientation, which is the one it lies along rather than the one it moves
	// in: a drawer beside the globe is divided from it by a vertical separator.
	readonly orientation: "horizontal" | "vertical";
	readonly resizeProps: MoveResult["moveProps"];
	// The size and the bounds it moves between, as percentages, for the separator's `aria-value*`.
	readonly value: number;
	readonly valueMax: number;
	readonly valueMin: number;
}

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

// The drawer is a fraction of the viewport because that is what the grid track holding it is a
// percentage of.
const viewportSize = (window: typeof globalThis, wide: boolean): number =>
	wide ? window.innerWidth : window.innerHeight;

// The drag that sizes the country drawer. `useMove` is what makes one handle answer to a mouse, a
// finger and the arrow keys alike; the rest is turning the deltas it reports into a fraction of
// the viewport, along whichever axis the drawer currently runs.
export const useMenuResize = (): MenuResize => {
	const window = useWindow();
	const wide = useMatchMedia(WIDE_SCREEN_QUERY);
	const [size, setSize] = useAtom(menuSizeAtom);

	const bounds = wide ? MENU_SIZE_BOUNDS.width : MENU_SIZE_BOUNDS.height;
	const fraction = wide ? size.width : size.height;

	// The size the drag is heading for, in pixels. Deltas arrive one at a time and what they add
	// up to is clamped, so the pixels have to be carried between events: reading them back off the
	// clamped fraction would swallow the part of a drag that overshot the bounds.
	const dragged = useRef(0);

	const onMoveStart = useCallback((): void => {
		dragged.current = fraction * viewportSize(window, wide);
	}, [fraction, wide, window]);

	const onMove = useCallback(
		(event: MoveMoveEvent): void => {
			const step = event.pointerType === "keyboard" ? KEYBOARD_STEP : 1;
			// The handle sits on the edge the drawer shares with the globe: the right edge when it
			// is a column, the top edge when it is a sheet. Pushing that edge into the globe is
			// what makes the drawer bigger, which is why a sheet grows as the pointer moves up.
			const delta = wide ? event.deltaX : -event.deltaY;
			const total = viewportSize(window, wide);
			dragged.current = clamp(
				dragged.current + delta * step,
				bounds.min * total,
				bounds.max * total,
			);
			const next = dragged.current / total;
			setSize((current) => (wide ? { ...current, width: next } : { ...current, height: next }));
		},
		[bounds, setSize, wide, window],
	);

	const { moveProps } = useMove({ onMove, onMoveStart });

	return {
		orientation: wide ? "vertical" : "horizontal",
		resizeProps: moveProps,
		value: Math.round(fraction * PERCENT),
		valueMax: Math.round(bounds.max * PERCENT),
		valueMin: Math.round(bounds.min * PERCENT),
	};
};
