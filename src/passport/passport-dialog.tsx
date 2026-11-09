import { memo, useCallback, useRef } from "react";
import type { FC } from "react";
import { useDialog } from "react-aria";
import type { OverlayTriggerAria } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { Modal } from "../core/modal.tsx";
import { m } from "../paraglide/messages.js";
import { PassportBook } from "./passport-book.tsx";
import { PassportControls } from "./passport-controls.tsx";
import { usePageTurns } from "./use-page-turns.ts";
import { usePassportSpread } from "./use-passport-spread.ts";

interface Props {
	/** The props `useOverlayTrigger` hands the dialog, which tie it to the button that opened it. */
	readonly overlayProps: OverlayTriggerAria["overlayProps"];
	readonly state: OverlayTriggerState;
}

/**
 * The passport for the map on show: opened at its cover each time, its pages turned with the
 * buttons beneath it or the arrow keys.
 */
export const PassportDialog: FC<Props> = memo(({ overlayProps, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog({}, ref);
	const spread = usePassportSpread();
	const keyboardProps = usePageTurns(ref, spread);

	const close = useCallback(() => {
		state.close();
	}, [state]);

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
				className="relative flex flex-col items-center gap-4 rounded-2xl bg-white px-6 pt-12 pb-6 text-zinc-900 shadow-xl focus:outline-none dark:bg-zinc-900 dark:text-white"
			>
				{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the title the dialog is labelled by. */}
				<h2 {...titleProps} className="sr-only">
					{m.passport_title()}
				</h2>
				<PassportBook spread={spread} onClose={close} />
				<PassportControls spread={spread} />
				<button
					type="button"
					className="absolute end-2 top-2 rounded-full p-2 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:bg-zinc-800"
					onClick={close}
					aria-label={m.passport_close()}
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
