import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { passportChaptersAtom, passportOpeningOfAtom } from "./pages.ts";
import { PassportChapterButton } from "./passport-chapter-button.tsx";

interface Props {
	/** Whether the passport lies open two pages at a time. */
	readonly spread: boolean;
}

/**
 * Buttons that open the passport straight at each of its parts, so the stamps are a tap away however
 * many pages of visas come before them. The part on show is marked.
 */
export const PassportChapters: FC<Props> = memo(({ spread }) => {
	const chapters = useAtomValue(passportChaptersAtom);
	const { shown } = useAtomValue(passportOpeningOfAtom)(spread);
	const showing = new Set(shown.map((page) => page?.kind));

	return chapters.length < 2 ? null : (
		<nav aria-label={m.passport_chapters()}>
			<ul className="flex flex-wrap justify-center gap-1">
				{chapters.map((start) => (
					<PassportChapterButton
						key={start.chapter}
						start={start}
						current={showing.has(start.chapter)}
					/>
				))}
			</ul>
		</nav>
	);
});
PassportChapters.displayName = "PassportChapters";
