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
 * It is as large as the screen leaves room for, up to a real passport's size and less what the
 * dialog puts around it across and down, so it always fits whole. Everything on its pages is sized
 * in fractions of its width, so the lettering, stamps and visas grow with it.
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
		<div className="@container aspect-[5/7] w-[min(31.5rem,calc(100vw-5rem),calc((100dvh-10.5rem)*5/7))] drop-shadow-xl">
			{page.kind === "cover" ? (
				<PassportCover onOpen={open} />
			) : (
				<div
					key={index}
					className="size-full origin-left overflow-hidden rounded-e-[4.2cqw] rounded-s-[1.4cqw] bg-[#f3eddc] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(29_43_79/0.035)_6px_7px)] motion-safe:animate-page-turn dark:bg-[#ece4cf]"
				>
					<PassportPageContent page={page} onClose={onClose} />
				</div>
			)}
		</div>
	);
});
PassportBook.displayName = "PassportBook";
