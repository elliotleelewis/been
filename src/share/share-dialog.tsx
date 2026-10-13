import { useAtomValue } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC } from "react";
import { useDialog } from "react-aria";
import type { OverlayTriggerAria } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { Modal } from "../core/modal.tsx";
import { m } from "../paraglide/messages.js";
import { ShareLink } from "./share-link.tsx";
import { shareUrlAtom, visitedCountAtom } from "./share.ts";

interface Props {
	/** The props `useOverlayTrigger` hands the dialog, which tie it to the button that opened it. */
	readonly overlayProps: OverlayTriggerAria["overlayProps"];
	readonly state: OverlayTriggerState;
}

/**
 * Shares the reader's map: a QR code to show someone in person, and the link it encodes to copy or
 * send, or while nothing is ticked, how to start a map worth sharing. It is a modal dialog,
 * labelled by its title, that hands focus back to the share button when it closes.
 */
export const ShareDialog: FC<Props> = memo(({ overlayProps, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog({}, ref);

	const url = useAtomValue(shareUrlAtom);
	const count = useAtomValue(visitedCountAtom);
	const handleDone = useCallback(() => {
		state.close();
	}, [state]);

	return (
		<Modal state={state}>
			<div
				// oxlint-disable-next-line react/jsx-props-no-spreading -- The dialog props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
				{...dialogProps}
				// oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for what ties the dialog to its trigger.
				{...overlayProps}
				ref={ref}
				className="flex w-80 max-w-full flex-col items-center gap-4 rounded-2xl bg-white p-6 text-zinc-900 shadow-xl focus:outline-none dark:bg-zinc-900 dark:text-white"
			>
				{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the title the dialog is labelled by. */}
				<h2 {...titleProps} className="font-semibold text-lg">
					{m.share_title()}
				</h2>
				<p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
					{count === 0 ? m.share_empty() : m.share_summary({ count })}
				</p>
				{count === 0 ? (
					<button
						type="button"
						className="rounded-full bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:bg-primary dark:text-white"
						onClick={handleDone}
					>
						{m.share_ok()}
					</button>
				) : (
					<ShareLink url={url} onDone={handleDone} />
				)}
			</div>
		</Modal>
	);
});
ShareDialog.displayName = "ShareDialog";
