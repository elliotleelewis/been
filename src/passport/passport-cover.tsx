import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { PassportCrest } from "./passport-crest.tsx";

interface Props {
	/** Opens the passport at its first page. */
	readonly onOpen: () => void;
}

/**
 * The passport's cover: navy board, foil lettering and the crest. It is the same in either colour
 * scheme, as the passport is an object on the page rather than part of the interface around it.
 */
export const PassportCover: FC<Props> = memo(({ onOpen }) => (
	<button
		type="button"
		className="flex size-full flex-col items-center justify-between rounded-e-xl rounded-s-sm bg-[#1d2b4f] px-6 py-10 text-[#d8b25a] shadow-inner focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none dark:bg-[#1d2b4f] dark:text-[#d8b25a]"
		onClick={onOpen}
		aria-label={m.passport_cover_open()}
	>
		<span className="font-semibold text-sm tracking-[0.35em]">{"PASSPORT"}</span>
		<PassportCrest variant="cover" />
		<span className="flex flex-col items-center gap-1">
			<span className="font-bold text-4xl tracking-wide">{"been"}</span>
			<span className="text-[0.6rem] uppercase tracking-[0.3em] opacity-70">
				{m.passport_cover_hint()}
			</span>
		</span>
	</button>
));
PassportCover.displayName = "PassportCover";
