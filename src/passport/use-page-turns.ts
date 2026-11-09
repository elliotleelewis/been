import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useKeyboard } from "react-aria";
import type { KeyboardEvents, KeyboardResult } from "react-aria";

import { passportPageAtom, turnPassportPageAtom } from "./pages.ts";

/** A key press as react-aria hands it over, which it does not export a name for. */
type KeyboardEvent = Parameters<NonNullable<KeyboardEvents["onKeyDown"]>>[0];

/** The arrow keys that turn the passport's pages, and which way each turns them. */
const TURNS: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1 };

/**
 * Keeps focus in the passport as its pages turn. Turning a page takes whatever was on it away, the
 * cover's own button as it opens, or a visa or stamp the reader was on, and focus would fall out of
 * the dialog to the page beneath, where the arrow keys and Escape no longer reach it. Whenever the
 * page turns and focus has gone with it, it is put back on the dialog itself.
 */
const usePageFocus = (dialog: RefObject<HTMLElement | null>): void => {
	const page = useAtomValue(passportPageAtom);
	const shownPage = useRef(page);

	useEffect(() => {
		const element = dialog.current;
		const turned = shownPage.current !== page;
		shownPage.current = page;
		if (turned && element !== null && !element.contains(globalThis.document.activeElement)) {
			element.focus({ preventScroll: true });
		}
	}, [dialog, page]);
};

/**
 * Turns the passport's pages with the arrow keys, a spread at a time where it lies open, for the
 * dialog the returned props go on, and keeps focus in it as they turn, so the keys keep reaching it.
 */
export const usePageTurns = (
	dialog: RefObject<HTMLElement | null>,
	spread: boolean,
): KeyboardResult["keyboardProps"] => {
	const turnPage = useSetAtom(turnPassportPageAtom);
	usePageFocus(dialog);
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const by = TURNS[event.key];
			if (by === undefined) {
				event.continuePropagation();
			} else {
				event.preventDefault();
				turnPage({ by, spread });
			}
		},
		[spread, turnPage],
	);
	return useKeyboard({ onKeyDown: handleKeyDown }).keyboardProps;
};
