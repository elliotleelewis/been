import { m } from "../paraglide/messages.js";
import type { PassportChapter, PassportPage } from "./types.ts";

/** What a page of each part of the passport is called, numbered, and a run of them. */
const NUMBERED: Readonly<
	Record<
		PassportChapter,
		{
			readonly one: (numbers: { page: number; pages: number }) => string;
			readonly run: (numbers: { from: number; to: number; pages: number }) => string;
		}
	>
> = {
	locked: { one: m.passport_page_locked, run: m.passport_pages_locked },
	stamps: { one: m.passport_page_stamps, run: m.passport_pages_stamps },
	visas: { one: m.passport_page_visas, run: m.passport_pages_visas },
};

/** A page of a numbered part of the passport. */
type NumberedPage = Extract<PassportPage, { readonly index: number }>;

/** What a single page is called. */
const pageNameOf = (page: PassportPage): string => {
	if (page.kind === "cover") {
		return m.passport_page_cover();
	}
	if (page.kind === "identity") {
		return m.passport_page_identity();
	}
	return NUMBERED[page.kind].one({ page: page.index + 1, pages: page.of });
};

/** Whether two pages are of one numbered part, `other` straight after `one`. */
const continues = (one: PassportPage, other: PassportPage): other is NumberedPage =>
	"index" in one && "index" in other && one.kind === other.kind && other.index === one.index + 1;

/**
 * What the pages the passport is open at are called, left to right: each page by name, except that
 * two facing pages of the same part are named as one run of them, as "Visas 1–2 of 3".
 */
export const openingNameOf = (shown: readonly (PassportPage | null)[]): string => {
	const pages = shown.filter((page) => page !== null);
	const [first, second] = pages;
	if (
		pages.length === 2 &&
		first !== undefined &&
		second !== undefined &&
		"index" in first &&
		continues(first, second)
	) {
		return NUMBERED[first.kind].run({
			from: first.index + 1,
			pages: first.of,
			to: second.index + 1,
		});
	}
	return pages.map((page) => pageNameOf(page)).join(" · ");
};
