import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC } from "react";
import { useButton, useToast } from "react-aria";
import type { QueuedToast, ToastState } from "react-stately";

import { countriesAtom } from "../core/countries.ts";
import { m } from "../paraglide/messages.js";
import { undoTapAtom } from "./taps.ts";
import type { Tap } from "./types.ts";

interface Props {
	readonly state: ToastState<Tap>;
	readonly toast: QueuedToast<Tap>;
}

/**
 * Says which country a tap on the globe just ticked or unticked, which is the only way a phone,
 * with no hover, learns what was under the reader's finger, and offers to take it back.
 */
export const TapToast: FC<Props> = memo(({ state, toast }) => {
	const toastRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const { closeButtonProps, contentProps, titleProps, toastProps } = useToast(
		{ toast },
		state,
		toastRef,
	);
	const { buttonProps } = useButton(closeButtonProps, closeRef);

	const countries = useAtomValue(countriesAtom);
	const undoTap = useSetAtom(undoTapAtom);
	const undo = useCallback(() => {
		undoTap();
	}, [undoTap]);

	const name = countries.find(({ iso3166 }) => iso3166 === toast.content.code)?.name;

	return (
		<div
			// oxlint-disable-next-line react/jsx-props-no-spreading -- The toast props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
			{...toastProps}
			ref={toastRef}
			className="pointer-events-auto flex items-center gap-1 rounded-full bg-zinc-900 py-1 ps-4 pe-1 text-sm text-white shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-primary/50 dark:bg-white dark:text-zinc-900"
		>
			{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the alert inside the toast. */}
			<div {...contentProps} className="me-3">
				{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the title the toast is labelled by. */}
				<div {...titleProps}>
					{(toast.content.previous === undefined ? m.globe_tap_added : m.globe_tap_removed)({
						country: name ?? toast.content.code,
					})}
				</div>
			</div>
			<button
				type="button"
				className="rounded-full px-3 py-1 font-semibold text-primary hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-zinc-900/10"
				onClick={undo}
			>
				{m.globe_undo()}
			</button>
			<button
				// oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the close button `useButton` builds.
				{...buttonProps}
				type="button"
				ref={closeRef}
				className="rounded-full p-1.5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:bg-zinc-900/10"
			>
				<svg
					className="size-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
				</svg>
			</button>
		</div>
	);
});
TapToast.displayName = "TapToast";
