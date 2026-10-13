import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import { passportPageAtom, turnPassportPageAtom } from "../state/passport";
import { PassportCover } from "./passport-cover";
import { PassportIdPage } from "./passport-id-page";
import { PassportStampPage } from "./passport-stamp-page";

interface Props {
	/** Closes the passport. */
	readonly onClose: () => void;
}

/** The pages before the first page of stamps: the cover, then the identity page. */
const PAGES_BEFORE_STAMPS = 2;

/**
 * The passport at the page it is open at. Pages after the cover are paper, the same in either
 * colour scheme, and each one turns in as it opens, unless the reader has asked for less motion.
 */
export const PassportBook: FC<Props> = memo(({ onClose }) => {
	const page = useAtomValue(passportPageAtom);
	const turnPage = useSetAtom(turnPassportPageAtom);
	const open = useCallback(() => {
		turnPage(1);
	}, [turnPage]);

	return (
		<div className="aspect-[5/7] w-72 max-w-full drop-shadow-xl">
			{page === 0 ? (
				<PassportCover onOpen={open} />
			) : (
				<div
					key={page}
					className="size-full origin-left overflow-hidden rounded-e-xl rounded-s-sm bg-[#f3eddc] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(29_43_79/0.035)_6px_7px)] motion-safe:animate-page-turn dark:bg-[#ece4cf]"
				>
					{page === 1 ? (
						<PassportIdPage />
					) : (
						<PassportStampPage index={page - PAGES_BEFORE_STAMPS} onClose={onClose} />
					)}
				</div>
			)}
		</div>
	);
});
PassportBook.displayName = "PassportBook";
