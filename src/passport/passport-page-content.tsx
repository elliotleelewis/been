import { memo } from "react";
import type { FC } from "react";

import { PassportIdPage } from "./passport-id-page.tsx";
import { PassportStampPage } from "./passport-stamp-page.tsx";
import { PassportVisaPage } from "./passport-visa-page.tsx";
import type { PassportPage } from "./types.ts";

interface Props {
	/** Closes the passport. */
	readonly onClose: () => void;
	readonly page: PassportPage;
}

/** What is printed on a page of the passport after its cover. */
export const PassportPageContent: FC<Props> = memo(({ onClose, page }) => {
	// The cover is drawn by the book itself, as board rather than paper.
	if (page.kind === "cover") {
		return null;
	}
	if (page.kind === "identity") {
		return <PassportIdPage />;
	}
	return page.kind === "visas" ? (
		<PassportVisaPage index={page.index} />
	) : (
		<PassportStampPage index={page.index} onClose={onClose} />
	);
});
PassportPageContent.displayName = "PassportPageContent";
