import { memo, useCallback } from "react";
import type { FC, ReactNode } from "react";

import { m } from "../paraglide/messages.js";
import { LockedVisaBack } from "./locked-visa-back.tsx";
import type { LockedVisa } from "./types.ts";
import { VisaTurn } from "./visa-turn.tsx";
import type { VisaTurnBack } from "./visa-turn.tsx";
import { Visa } from "./visa.tsx";

interface Props {
	readonly visa: LockedVisa;
}

/**
 * A visa not yet issued: its print faded and without foil, stamped with how many more countries it
 * needs, which turns over to list the countries that would do.
 */
export const LockedVisaCard: FC<Props> = memo(({ visa }) => {
	const { achievement, design, remaining } = visa;
	const renderBack = useCallback(
		({ buttonRef, id, onFlipBack, shown }: VisaTurnBack): ReactNode => (
			<LockedVisaBack
				id={id}
				visa={visa}
				shown={shown}
				buttonRef={buttonRef}
				onFlipBack={onFlipBack}
			/>
		),
		[visa],
	);

	return (
		<VisaTurn
			id={achievement.id}
			renderBack={renderBack}
			front={
				<>
					<span className="relative block aspect-[300/190] w-full" aria-hidden="true">
						<span className="block size-full opacity-40 grayscale">
							<Visa visa={visa} />
						</span>
						<span
							className="absolute inset-y-0 start-[2%] grid w-[32%] place-items-center"
							style={{ color: design.ink }}
						>
							<span className="-rotate-6 rounded-[1.5cqw] border-[0.7cqw] border-current bg-[#fbf7ec]/70 px-[2cqw] py-[0.5cqw] text-[5cqw] whitespace-nowrap font-black tracking-[0.5cqw]">
								{`${String(remaining)} TO GO`}
							</span>
						</span>
					</span>
					<span className="sr-only">
						{m.passport_visa_locked({ ...achievement, count: remaining })}
					</span>
				</>
			}
		/>
	);
});
LockedVisaCard.displayName = "LockedVisaCard";
