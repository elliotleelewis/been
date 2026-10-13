import { useSetAtom } from "jotai";
import { memo, useCallback, useEffect, useRef } from "react";
import type { FC } from "react";
import { useDialog, useKeyboard } from "react-aria";
import type { KeyboardEvents, OverlayTriggerAria } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { passportPageAtom, turnPassportPageAtom } from "../state/passport-pages";
import { Modal } from "./modal";
import { PassportBook } from "./passport-book";
import { PassportControls } from "./passport-controls";

interface Props {
	/** The props `useOverlayTrigger` hands the dialog, which tie it to the button that opened it. */
	readonly overlayProps: OverlayTriggerAria["overlayProps"];
	readonly state: OverlayTriggerState;
}

/** A key press as react-aria hands it over, which it does not export a name for. */
type KeyboardEvent = Parameters<NonNullable<KeyboardEvents["onKeyDown"]>>[0];

/** The arrow keys that turn the passport's pages, and which way each turns them. */
const TURNS: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1 };

/**
 * The passport for the map on show: opened at its cover each time, its pages turned with the
 * buttons beneath it or the arrow keys.
 */
export const PassportDialog: FC<Props> = memo(({ overlayProps, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog({}, ref);
	const setPage = useSetAtom(passportPageAtom);
	const turnPage = useSetAtom(turnPassportPageAtom);

	useEffect(() => {
		setPage(0);
	}, [setPage]);

	const close = useCallback(() => {
		state.close();
	}, [state]);
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const by = TURNS[event.key];
			if (by === undefined) {
				event.continuePropagation();
			} else {
				event.preventDefault();
				turnPage(by);
			}
		},
		[turnPage],
	);
	const { keyboardProps } = useKeyboard({ onKeyDown: handleKeyDown });

	return (
		<Modal state={state}>
			<div
				// oxlint-disable-next-line react/jsx-props-no-spreading -- The dialog props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
				{...dialogProps}
				// oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for what ties the dialog to its trigger.
				{...overlayProps}
				// oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the arrow keys that turn the pages.
				{...keyboardProps}
				ref={ref}
				className="relative flex w-80 max-w-full flex-col items-center gap-4 rounded-2xl bg-white p-6 text-zinc-900 shadow-xl focus:outline-none dark:bg-zinc-900 dark:text-white"
			>
				{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the title the dialog is labelled by. */}
				<h2 {...titleProps} className="sr-only">
					{"Passport"}
				</h2>
				<PassportBook onClose={close} />
				<PassportControls />
				<button
					type="button"
					className="absolute end-2 top-2 rounded-full p-2 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:bg-zinc-800"
					onClick={close}
					aria-label="Close the passport"
				>
					<svg
						className="size-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</div>
		</Modal>
	);
});
PassportDialog.displayName = "PassportDialog";
