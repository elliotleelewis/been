import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useEffect } from "react";
import type { FC } from "react";

import { countriesAtom } from "../state/atoms.ts";
import { lastTapAtom, undoTapAtom } from "../state/taps.ts";

// Long enough to read the name and reach for the button, short enough to be gone before the next
// country is tapped in a run of them.
const TOAST_DURATION_MS = 5000;

// Says which country a tap on the globe just ticked or unticked, which is the only way a phone,
// with no hover, learns what was under the reader's finger, and offers to take it back.
export const TapToast: FC = memo(() => {
	const [tap, setTap] = useAtom(lastTapAtom);
	const countries = useAtomValue(countriesAtom);
	const undoTap = useSetAtom(undoTapAtom);

	// Each tap starts the clock again, so a run of taps keeps the latest of them on screen.
	useEffect(() => {
		const timeout =
			tap === null
				? undefined
				: globalThis.setTimeout(() => {
						setTap(null);
					}, TOAST_DURATION_MS);
		return (): void => {
			globalThis.clearTimeout(timeout);
		};
	}, [tap, setTap]);

	const undo = useCallback(() => {
		undoTap();
	}, [undoTap]);

	const name = countries.find(({ iso3166 }) => iso3166 === tap?.code)?.name;

	return (
		// Always present, and only its contents change, because a live region announces what is
		// added to it rather than a region that arrives already filled.
		<output className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center px-4">
			{tap === null || name === undefined ? null : (
				<div className="pointer-events-auto flex items-center gap-4 rounded-full bg-zinc-900 py-2 ps-4 pe-2 text-sm text-white shadow-lg dark:bg-white dark:text-zinc-900">
					<span>{`${tap.previous === undefined ? "Added" : "Removed"} ${name}`}</span>
					<button
						type="button"
						className="rounded-full px-2 py-1 font-semibold text-primary hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-primary dark:hover:bg-zinc-900/10"
						onClick={undo}
					>
						{"Undo"}
					</button>
				</div>
			)}
		</output>
	);
});
TapToast.displayName = "TapToast";
