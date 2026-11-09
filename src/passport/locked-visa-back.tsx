import classNames from "classnames";
import { memo } from "react";
import type { FC, RefObject } from "react";

import { m } from "../paraglide/messages.js";
import { LockedVisaGroup } from "./locked-visa-group.tsx";
import type { LockedVisa } from "./types.ts";
import { VisaBackBand } from "./visa-back-band.tsx";

interface Props {
	/** Given to the back's root, so the button that turns the visa over can say what it shows. */
	readonly id: string;
	readonly visa: LockedVisa;
	/** Whether the back is the side on show. */
	readonly shown: boolean;
	/** The button that turns the visa back over, which takes focus when the back comes round. */
	readonly buttonRef: RefObject<HTMLButtonElement | null>;
	/** Turns the visa back over to its front. */
	readonly onFlipBack: () => void;
}

/**
 * The back of a locked visa: for each of its requirements still to meet, how many more it needs and
 * every country that would do, those recommended next first and starred. The list scrolls when it
 * is longer than the visa.
 */
export const LockedVisaBack: FC<Props> = memo(({ buttonRef, id, onFlipBack, shown, visa }) => (
	<div
		id={id}
		className={classNames(
			"absolute inset-0 flex flex-col overflow-hidden rounded-[2cqw] bg-[color-mix(in_oklab,currentColor_7%,#fbf7ec)] shadow-sm ring-1 ring-current/60 backface-hidden motion-safe:rotate-y-180 motion-reduce:transition-opacity motion-reduce:duration-300",
			{ "pointer-events-none motion-reduce:opacity-0": !shown },
		)}
		style={{ color: visa.design.ink, rotate: `${String(visa.design.rotation)}deg` }}
		inert={!shown}
	>
		<VisaBackBand
			heading="STILL TO VISIT"
			visa={visa}
			buttonRef={buttonRef}
			onFlipBack={onFlipBack}
		/>
		<section
			className="m-[3cqw] min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[1cqw] pb-[6cqw] text-[2.9cqw] text-[#3b3a35] [mask-image:linear-gradient(to_bottom,#000_calc(100%-6cqw),transparent)] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
			// A list that scrolls has to take focus, or there is no scrolling it from the keyboard.
			// oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- See above.
			tabIndex={0}
			aria-label={m.passport_visa_locked_countries(visa.achievement)}
		>
			{visa.groups.map((group) => (
				<LockedVisaGroup key={group.label ?? ""} group={group} />
			))}
		</section>
	</div>
));
LockedVisaBack.displayName = "LockedVisaBack";
