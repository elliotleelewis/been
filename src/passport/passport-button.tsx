import { useSetAtom } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC } from "react";
import { useButton, useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";

import { m } from "../paraglide/messages.js";
import { openPassportAtom } from "./pages.ts";
import { PassportDialog } from "./passport-dialog.tsx";
import { PassportIcon } from "./passport-icon.tsx";

/** Opens the passport, of the reader's own map or of a shared one while that is on show. */
export const PassportButton: FC = memo(() => {
	const openPassport = useSetAtom(openPassportAtom);
	// Opened at its cover each time, as it is opened, rather than once it is on screen.
	const openChange = useCallback(
		(open: boolean) => {
			if (open) {
				openPassport();
			}
		},
		[openPassport],
	);
	const state = useOverlayTriggerState({ onOpenChange: openChange });
	const ref = useRef<HTMLButtonElement>(null);
	const { overlayProps, triggerProps } = useOverlayTrigger({ type: "dialog" }, state, ref);
	const { buttonProps } = useButton(triggerProps, ref);

	return (
		<>
			<button
				// oxlint-disable-next-line react/jsx-props-no-spreading -- The button props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
				{...buttonProps}
				type="button"
				ref={ref}
				className="rounded-full p-2 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none dark:hover:bg-zinc-800 dark:focus-visible:ring-primary/50"
				aria-label={m.passport_open()}
			>
				<PassportIcon />
			</button>
			{state.isOpen ? <PassportDialog overlayProps={overlayProps} state={state} /> : null}
		</>
	);
});
PassportButton.displayName = "PassportButton";
