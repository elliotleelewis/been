import { memo, useRef } from "react";
import type { FC } from "react";
import { useButton, useOverlayTrigger } from "react-aria";
import { useOverlayTriggerState } from "react-stately";

import { PassportDialog } from "./passport-dialog";

/** Opens the passport, of the reader's own map or of a shared one while that is on show. */
export const PassportButton: FC = memo(() => {
	const state = useOverlayTriggerState({});
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
				aria-label="Open your passport"
			>
				<svg
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<rect x="5" y="3" width="14" height="18" rx="2" />
					<circle cx="12" cy="10" r="3" />
					<path d="M9 16h6" />
				</svg>
			</button>
			{state.isOpen ? <PassportDialog overlayProps={overlayProps} state={state} /> : null}
		</>
	);
});
PassportButton.displayName = "PassportButton";
