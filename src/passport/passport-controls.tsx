import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { passportOpeningOfAtom, turnPassportPageAtom } from "./pages.ts";
import type { PassportPage } from "./types.ts";

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:disabled:hover:bg-transparent";

/** What a page the passport is open at is called, beneath it. */
const pageNameOf = (page: PassportPage): string => {
	if (page.kind === "cover") {
		return m.passport_page_cover();
	}
	if (page.kind === "identity") {
		return m.passport_page_identity();
	}
	const numbers = { page: page.index + 1, pages: page.of };
	return page.kind === "visas" ? m.passport_page_visas(numbers) : m.passport_page_stamps(numbers);
};

interface Props {
	/** Whether the passport lies open two pages at a time, which it then turns a spread at a time. */
	readonly spread: boolean;
}

/**
 * Turns the passport's pages back and forward, and says which pages it is open at, both of them
 * where it lies open at a spread.
 */
export const PassportControls: FC<Props> = memo(({ spread }) => {
	const { shown, turns } = useAtomValue(passportOpeningOfAtom)(spread);
	const turnPage = useSetAtom(turnPassportPageAtom);
	const back = useCallback(() => {
		turnPage({ by: -1, spread });
	}, [spread, turnPage]);
	const forward = useCallback(() => {
		turnPage({ by: 1, spread });
	}, [spread, turnPage]);

	return (
		<div className="flex w-full items-center justify-between gap-2">
			<button type="button" className={BUTTON_CLASS_NAME} onClick={back} disabled={!turns.back}>
				{m.passport_back()}
			</button>
			<p className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400" aria-live="polite">
				{shown.flatMap((page) => (page === null ? [] : [pageNameOf(page)])).join(" · ")}
			</p>
			<button
				type="button"
				className={BUTTON_CLASS_NAME}
				onClick={forward}
				disabled={!turns.forward}
			>
				{m.passport_next()}
			</button>
		</div>
	);
});
PassportControls.displayName = "PassportControls";
