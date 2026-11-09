import { memo } from "react";
import type { FC, RefObject } from "react";

import { m } from "../paraglide/messages.js";
import type { Visa, VisaBack as VisaBackModel } from "./types.ts";
import { VisaBackBand } from "./visa-back-band.tsx";
import { VisaBackClincher } from "./visa-back-clincher.tsx";
import { VisaBackGroup } from "./visa-back-group.tsx";

interface Props {
	/** Given to the back's root, so the button that turns the visa over can say what it shows. */
	readonly id: string;
	readonly visa: Visa;
	readonly back: VisaBackModel;
	/** Whether the back is the side on show. */
	readonly shown: boolean;
	/** The button that turns the visa back over, which takes focus when the back comes round. */
	readonly buttonRef: RefObject<HTMLButtonElement | null>;
	/** Turns the visa back over to its front. */
	readonly onFlipBack: () => void;
}

/**
 * The back of a visa, as the entry record a real one carries: on the left, the stamp of the country
 * whose tick earned it, and on the right every country that did, in the order they were ticked,
 * then those that also count. The list scrolls when it is longer than the visa. Sizes are in
 * fractions of the visa's width, so the back scales with it as the front, an SVG, does.
 */
export const VisaBack: FC<Props> = memo(({ back, buttonRef, id, onFlipBack, shown, visa }) => {
	const clincher = back.clincher?.stamp.country.iso3166;

	return (
		<div
			id={id}
			className={`absolute inset-0 flex flex-col overflow-hidden rounded-[2cqw] bg-[color-mix(in_oklab,currentColor_7%,#fbf7ec)] shadow-sm ring-1 ring-current/60 backface-hidden motion-safe:rotate-y-180 motion-reduce:transition-opacity motion-reduce:duration-300 ${shown ? "" : "pointer-events-none motion-reduce:opacity-0"}`}
			style={{ color: visa.design.ink, rotate: `${String(visa.design.rotation)}deg` }}
			inert={!shown}
		>
			<VisaBackBand
				heading="ENTRY RECORD"
				visa={visa}
				buttonRef={buttonRef}
				onFlipBack={onFlipBack}
			/>
			<div className="grid min-h-0 flex-1 grid-cols-[36%_1fr] gap-[3cqw] p-[3cqw] text-[#3b3a35]">
				<VisaBackClincher clincher={back.clincher} />
				<section
					className="min-h-0 overflow-y-auto overscroll-contain rounded-[1cqw] pb-[6cqw] text-[2.9cqw] [mask-image:linear-gradient(to_bottom,#000_calc(100%-6cqw),transparent)] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
					// A list that scrolls has to take focus, or there is no scrolling it from the keyboard.
					// oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- See above.
					tabIndex={0}
					aria-label={m.passport_visa_countries(visa.achievement)}
				>
					{back.groups.map((group, index) => (
						// oxlint-disable-next-line react/no-array-index-key -- Requirements are fixed and in order, with nothing else to tell them apart by.
						<VisaBackGroup key={index} group={group} clincher={clincher} />
					))}
				</section>
			</div>
		</div>
	);
});
VisaBack.displayName = "VisaBack";
