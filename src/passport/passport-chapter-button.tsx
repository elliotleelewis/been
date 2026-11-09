import { useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { jumpToPassportPageAtom } from "./pages.ts";
import type { PassportChapter, PassportChapterStart } from "./types.ts";

/** What each part of the passport is called, on the button that opens it there. */
const CHAPTER_NAMES: Readonly<Record<PassportChapter, () => string>> = {
	locked: m.passport_chapter_locked,
	stamps: m.passport_chapter_stamps,
	visas: m.passport_chapter_visas,
};

interface Props {
	readonly start: PassportChapterStart;
	/** Whether a page of it is on show. */
	readonly current: boolean;
}

/** A button that opens the passport at the first page of one of its parts. */
export const PassportChapterButton: FC<Props> = memo(({ current, start }) => {
	const jump = useSetAtom(jumpToPassportPageAtom);
	const open = useCallback(() => {
		jump(start.page);
	}, [jump, start.page]);

	return (
		<li>
			<button
				type="button"
				className={`rounded-full px-3 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${current ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
				onClick={open}
				aria-current={current ? "page" : undefined}
			>
				{CHAPTER_NAMES[start.chapter]()}
			</button>
		</li>
	);
});
PassportChapterButton.displayName = "PassportChapterButton";
