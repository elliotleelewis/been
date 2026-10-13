import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { passportPageAtom, passportPagesAtom, turnPassportPageAtom } from "./pages.ts";
import { PassportCover } from "./passport-cover.tsx";
import { PassportPageContent } from "./passport-page-content.tsx";

interface Props {
	/** Closes the passport. */
	readonly onClose: () => void;
}

/**
 * The passport at the page it is open at. Pages after the cover are paper, the same in either
 * colour scheme, and each one turns in as it opens, unless the reader has asked for less motion.
 */
export const PassportBook: FC<Props> = memo(({ onClose }) => {
	const index = useAtomValue(passportPageAtom);
	const pages = useAtomValue(passportPagesAtom);
	const turnPage = useSetAtom(turnPassportPageAtom);
	const open = useCallback(() => {
		turnPage(1);
	}, [turnPage]);
	const page = pages[index] ?? { kind: "cover" };

	return (
		<div className="aspect-[5/7] w-72 max-w-full drop-shadow-xl">
			{page.kind === "cover" ? (
				<PassportCover onOpen={open} />
			) : (
				<div
					key={index}
					className="size-full origin-left overflow-hidden rounded-e-xl rounded-s-sm bg-[#f3eddc] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(29_43_79/0.035)_6px_7px)] motion-safe:animate-page-turn dark:bg-[#ece4cf]"
				>
					<PassportPageContent page={page} onClose={onClose} />
				</div>
			)}
		</div>
	);
});
PassportBook.displayName = "PassportBook";
