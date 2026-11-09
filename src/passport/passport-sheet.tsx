import { memo } from "react";
import type { FC } from "react";

import { PassportCover } from "./passport-cover.tsx";
import { PassportPageContent } from "./passport-page-content.tsx";
import type { PassportPage } from "./types.ts";

/** Where a sheet lies: on its own, or on either side of the spine of an open spread. */
export type SheetPlace = "alone" | "left" | "right";

interface Props {
	/** What is printed on it, or nothing for the blank page facing the last. */
	readonly page: PassportPage | null;
	readonly place: SheetPlace;
	/** Whether the passport lies open two pages at a time, which leaves each page half the room. */
	readonly spread: boolean;
	/** Opens the passport from its cover. */
	readonly onOpen: () => void;
	/** Closes the passport. */
	readonly onClose: () => void;
}

/**
 * How wide a page is: as large as the screen leaves room for, up to a real passport's size and less
 * what the dialog puts around it across and down, so the book always fits whole; and half the room
 * across, where it lies open.
 */
const WIDTHS: Readonly<Record<"single" | "spread", string>> = {
	single: "w-[min(31.5rem,calc(100vw-5rem),calc((100dvh-10.5rem)*5/7))]",
	spread: "w-[min(31.5rem,calc((100vw-5rem)/2),calc((100dvh-10.5rem)*5/7))]",
};

/**
 * How the paper sits, by place: a page on its own has the spine at its left, and a spread's pages
 * meet at it, each shaded towards the fold. Each turns in from the spine as it opens.
 */
const PAPERS: Readonly<Record<SheetPlace, string>> = {
	alone: "origin-left rounded-e-[4.2cqw] rounded-s-[1.4cqw] motion-safe:animate-page-turn",
	left: "origin-right rounded-s-[4.2cqw] shadow-[inset_-6cqw_0_5cqw_-5cqw_rgb(29_43_79/0.22)] motion-safe:animate-page-turn-back",
	right:
		"origin-left rounded-e-[4.2cqw] shadow-[inset_6cqw_0_5cqw_-5cqw_rgb(29_43_79/0.22)] motion-safe:animate-page-turn",
};

/**
 * One sheet of the passport: its cover, board rather than paper, or a page, paper the same in either
 * colour scheme. Everything on it is sized in fractions of its width, so it grows with the screen.
 */
export const PassportSheet: FC<Props> = memo(({ onClose, onOpen, page, place, spread }) => (
	<div className={`@container aspect-[5/7] shrink-0 ${WIDTHS[spread ? "spread" : "single"]}`}>
		{page?.kind === "cover" ? (
			<PassportCover onOpen={onOpen} />
		) : (
			<div
				className={`size-full overflow-hidden bg-[#f3eddc] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(29_43_79/0.035)_6px_7px)] dark:bg-[#ece4cf] ${PAPERS[place]}`}
			>
				{page === null ? null : <PassportPageContent page={page} onClose={onClose} />}
			</div>
		)}
	</div>
));
PassportSheet.displayName = "PassportSheet";
