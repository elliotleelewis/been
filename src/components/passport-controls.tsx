import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { passportPageAtom, passportPageCountAtom, turnPassportPageAtom } from "../state/passport";

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:disabled:hover:bg-transparent";

/** What the page the passport is open at is called, beneath it. */
const pageNameOf = (page: number, count: number): string => {
	if (page === 0) {
		return "Cover";
	}
	return page === 1 ? "Identity" : `Stamps ${String(page - 1)} of ${String(count - 2)}`;
};

/** Turns the passport's pages back and forward, and says which page it is open at. */
export const PassportControls: FC = memo(() => {
	const page = useAtomValue(passportPageAtom);
	const count = useAtomValue(passportPageCountAtom);
	const turnPage = useSetAtom(turnPassportPageAtom);
	const back = useCallback(() => {
		turnPage(-1);
	}, [turnPage]);
	const forward = useCallback(() => {
		turnPage(1);
	}, [turnPage]);

	return (
		<div className="flex w-full items-center justify-between gap-2">
			<button type="button" className={BUTTON_CLASS_NAME} onClick={back} disabled={page === 0}>
				{"‹ Back"}
			</button>
			<p className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400" aria-live="polite">
				{pageNameOf(page, count)}
			</p>
			<button
				type="button"
				className={BUTTON_CLASS_NAME}
				onClick={forward}
				disabled={page === count - 1}
			>
				{"Next ›"}
			</button>
		</div>
	);
});
PassportControls.displayName = "PassportControls";
