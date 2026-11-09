import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { clearStoredThingsAtom, clearingAtom } from "./clearing.ts";
import { useStoredThings } from "./use-stored-things.ts";

/** What the line beside the button says. */
const statusOf = (stored: boolean, clearing: "armed" | "cleared" | "idle"): string => {
	if (clearing === "cleared") {
		return m.cookies_storage_cleared();
	}
	return stored ? "" : m.cookies_storage_empty();
};

/**
 * Clears the reader's map and settings from their browser, once they tap a second time to confirm,
 * as it cannot be undone. Where the browser blocks storage there is nothing to clear, and nothing
 * is shown.
 */
export const StorageClear: FC = memo(() => {
	const stored = useStoredThings();
	const clearing = useAtomValue(clearingAtom);
	const clearStoredThings = useSetAtom(clearStoredThingsAtom);
	const clear = useCallback(() => {
		clearStoredThings();
	}, [clearStoredThings]);

	return stored === null ? null : (
		<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
			<button
				type="button"
				className="cursor-pointer rounded-full border border-red-600 px-5 py-2.5 font-semibold text-red-700 focus-visible:ring-4 focus-visible:ring-red-600/40 focus-visible:outline-none enabled:hover:bg-red-50 disabled:cursor-default disabled:border-zinc-300 disabled:text-zinc-500 dark:border-red-400 dark:text-red-300 dark:enabled:hover:bg-red-950 dark:disabled:border-zinc-600 dark:disabled:text-zinc-400"
				onClick={clear}
				disabled={!stored}
			>
				{clearing === "armed" ? m.cookies_storage_confirm() : m.cookies_storage_clear()}
			</button>
			<p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
				{statusOf(stored, clearing)}
			</p>
		</div>
	);
});
StorageClear.displayName = "StorageClear";
