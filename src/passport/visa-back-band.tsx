import { memo } from "react";
import type { FC, RefObject } from "react";

import { m } from "../paraglide/messages.js";
import type { Visa } from "./types.ts";

interface Props {
	/** What the back is, in the passport's own lettering. */
	readonly heading: string;
	readonly visa: Visa;
	/** The button that turns the visa back over, which takes focus when the back comes round. */
	readonly buttonRef: RefObject<HTMLButtonElement | null>;
	/** Turns the visa back over to its front. */
	readonly onFlipBack: () => void;
}

/**
 * The band along the top of a visa's back, filled with the colour it inherits, the visa's ink, so
 * only its lettering is set in paper colour: what the back is, the visa's
 * category and number, and a button that turns it back over.
 */
export const VisaBackBand: FC<Props> = memo(({ buttonRef, heading, onFlipBack, visa }) => (
	<div className="flex h-[8.7cqw] shrink-0 items-center gap-[2cqw] bg-current ps-[4cqw] pe-[1.5cqw]">
		<span className="text-[3.6cqw] font-extrabold tracking-[0.9cqw] whitespace-nowrap text-[#fbf7ec]">
			{heading}
		</span>
		<span className="ms-auto truncate text-[2.5cqw] font-semibold tracking-[0.3cqw] text-[#fbf7ec]">
			{`${visa.design.type} · No ${visa.design.serial}`}
		</span>
		<button
			ref={buttonRef}
			type="button"
			className="grid size-[6.5cqw] shrink-0 place-items-center rounded-full text-[#fbf7ec] hover:bg-[#fbf7ec]/20 focus-visible:ring-2 focus-visible:ring-[#fbf7ec] focus-visible:outline-none"
			onClick={onFlipBack}
			aria-label={m.passport_visa_flip_back(visa.achievement)}
		>
			<svg
				className="size-[4cqw]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
				<path d="M3 3v5h5" />
			</svg>
		</button>
	</div>
));
VisaBackBand.displayName = "VisaBackBand";
