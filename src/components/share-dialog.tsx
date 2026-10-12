import { useAtomValue } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC } from "react";
import { useDialog } from "react-aria";
import type { OverlayTriggerAria } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

import { useShareLink } from "../hooks/use-share-link";
import { shareUrlAtom, visitedCountAtom } from "../state/share";
import { Modal } from "./modal";
import { QrCode } from "./qr-code";

interface Props {
	/** The props `useOverlayTrigger` hands the dialog, which tie it to the button that opened it. */
	readonly overlayProps: OverlayTriggerAria["overlayProps"];
	readonly state: OverlayTriggerState;
}

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

/**
 * Shares the reader's map: a QR code to show someone in person, and the link it encodes to copy or
 * send. It is a modal dialog, labelled by its title, that hands focus back to the share button
 * when it closes.
 */
export const ShareDialog: FC<Props> = memo(({ overlayProps, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { dialogProps, titleProps } = useDialog({}, ref);

	const url = useAtomValue(shareUrlAtom);
	const count = useAtomValue(visitedCountAtom);
	const { copied, copy, share } = useShareLink(url);
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
					{"Share your map"}
				</h2>
				<p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
					{`Anyone with the link sees your ${String(count)} ${count === 1 ? "country" : "countries"}, and can't change them.`}
				</p>
				<QrCode label="QR code for the link to your map" text={url} />
				<input
					className="w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 focus:border-primary focus:ring-primary/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
					type="url"
					value={url}
					readOnly
					aria-label="Link to your map"
				/>
				<div className="flex w-full flex-wrap justify-center gap-2">
					<button
						type="button"
						className={`${BUTTON_CLASS_NAME} bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white`}
						onClick={copy}
					>
						{copied ? "Copied!" : "Copy link"}
					</button>
					{share === undefined ? null : (
						<button
							type="button"
							className={`${BUTTON_CLASS_NAME} bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700`}
							onClick={share}
						>
							{"Share…"}
						</button>
					)}
					<button
						type="button"
						className={`${BUTTON_CLASS_NAME} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
						onClick={handleDone}
					>
						{"Done"}
					</button>
				</div>
			</div>
		</Modal>
	);
});
ShareDialog.displayName = "ShareDialog";
