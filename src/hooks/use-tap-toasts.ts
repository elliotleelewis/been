import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ToastQueue, useToastQueue } from "react-stately";
import type { ToastState } from "react-stately";

import type { Tap } from "../models/tap.ts";
import { lastTapAtom } from "../state/taps.ts";

// Long enough to read the name and reach for the button. The toast region holds the clock still
// while the pointer or focus is on a toast, so this is a floor rather than a deadline.
const TAP_TOAST_TIMEOUT_MS = 5000;

// Feeds each tap into a toast queue, one toast at a time, and lets the tap go once its toast does.
// The tap stays in `lastTapAtom`, because the undo needs it; the queue only decides what is shown.
export const useTapToasts = (): ToastState<Tap> => {
	const [tap, setTap] = useAtom(lastTapAtom);
	// oxlint-disable-next-line react/hook-use-state -- The queue is made once and never replaced, so there is no setter to name.
	const [queue] = useState(() => new ToastQueue<Tap>({ maxVisibleToasts: 1 }));
	const state = useToastQueue(queue);

	useEffect(() => {
		const key =
			tap === null
				? undefined
				: queue.add(tap, {
						onClose: () => {
							// Only this toast's own tap; a newer one has a toast of its own.
							setTap((current) => (current === tap ? null : current));
						},
						timeout: TAP_TOAST_TIMEOUT_MS,
					});
		return (): void => {
			if (key !== undefined) {
				queue.close(key);
			}
		};
	}, [queue, setTap, tap]);

	return state;
};
