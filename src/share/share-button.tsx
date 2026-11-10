import { useAtomValue } from "jotai";
import { memo, useRef } from "react";
import type { FC } from "react";
import { useButton, useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";

import { viewingSharedMapAtom } from "../core/location.ts";
import { m } from "../paraglide/messages.js";
import { ShareDialog } from "./share-dialog.tsx";
import { ShareIcon } from "./share-icon.tsx";

/**
 * Opens the share dialog. It is not there while a shared map is on show, which is someone else's
 * map, not the reader's to share.
 */
export const ShareButton: FC = memo(() => {
	const viewingSharedMap = useAtomValue(viewingSharedMapAtom);
	const state = useOverlayTriggerState({});
	const ref = useRef<HTMLButtonElement>(null);
	const { overlayProps, triggerProps } = useOverlayTrigger({ type: "dialog" }, state, ref);
	const { buttonProps } = useButton(triggerProps, ref);

	if (viewingSharedMap) {
		return null;
	}

	return (
		<>
			<button
				// oxlint-disable-next-line react/jsx-props-no-spreading -- The button props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
				{...buttonProps}
				type="button"
				ref={ref}
				className="rounded-full p-2 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none dark:hover:bg-zinc-800 dark:focus-visible:ring-primary/50"
				aria-label={m.share_open()}
			>
				<ShareIcon />
			</button>
			{state.isOpen ? <ShareDialog overlayProps={overlayProps} state={state} /> : null}
		</>
	);
});
ShareButton.displayName = "ShareButton";
