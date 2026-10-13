import { memo } from "react";
import type { FC } from "react";

import { fontSizeFor } from "./lettering.ts";
import { VISA_HEIGHT, VISA_WIDTH } from "./types.ts";
import type { Visa as VisaModel } from "./types.ts";
import { visaMrzOf } from "./visa-design.ts";
import { VisaPattern } from "./visa-pattern.tsx";

interface Props {
	readonly visa: VisaModel;
}

/** Where the lettering beside the medallion starts, and how much room it has. */
const TEXT_LEFT = 110;
const TEXT_ROOM = 176;
const TITLE_SIZE = 19;
const DESCRIPTION_SIZE = 8.5;
const MARGIN = 12;

/**
 * A visa for an achievement, as one stuck into a passport: a band naming its category, a printed
 * medallion and line-work in its ink, what it was for, the day it was issued, and a
 * machine-readable line along its foot. It is the same for an achievement every time. It is a
 * picture only, hidden from assistive technology; whatever shows it says what it is for in words.
 */
export const Visa: FC<Props> = memo(({ visa }) => {
	const { achievement, date, design } = visa;
	const title = achievement.title.toUpperCase();
	const fields: readonly (readonly [string, string])[] = [
		["Issued", date ?? "—"],
		["Entries", "Multiple"],
		["Valid", "For life"],
	];

	return (
		<svg
			className="size-full overflow-visible drop-shadow-sm"
			viewBox={`0 0 ${String(VISA_WIDTH)} ${String(VISA_HEIGHT)}`}
			aria-hidden="true"
		>
			<g color={design.ink} transform={`rotate(${String(design.rotation)} 150 95)`}>
				<rect width={VISA_WIDTH} height={VISA_HEIGHT} rx="6" fill="#fbf7ec" />
				<rect width={VISA_WIDTH} height={VISA_HEIGHT} rx="6" fill="currentColor" opacity="0.07" />
				<VisaPattern seed={design.seed} />
				<path d="M6 0h288a6 6 0 0 1 6 6v20H0V6a6 6 0 0 1 6-6Z" fill="currentColor" />
				<text x={MARGIN} y="18" fill="#fbf7ec" fontSize="12" fontWeight="800" letterSpacing="4">
					{"VISA"}
				</text>
				<text
					x={VISA_WIDTH - MARGIN}
					y="17.5"
					fill="#fbf7ec"
					fontSize="8"
					fontWeight="600"
					letterSpacing="1.5"
					textAnchor="end"
				>
					{`${design.type} · No ${design.serial}`}
				</text>
				<text
					x={TEXT_LEFT}
					y="66"
					fill="currentColor"
					fontSize={fontSizeFor(title, TEXT_ROOM, TITLE_SIZE)}
					fontWeight="800"
				>
					{title}
				</text>
				<text x={TEXT_LEFT} y="84" fill="#3b3a35" fontSize={DESCRIPTION_SIZE} opacity="0.85">
					{achievement.description}
				</text>
				{fields.map(([label, value], index) => (
					<g key={label} transform={`translate(${String(TEXT_LEFT + index * 62)} 112)`}>
						<text fill="#3b3a35" fontSize="5.5" letterSpacing="0.8" opacity="0.6">
							{label.toUpperCase()}
						</text>
						<text y="11" fill="#3b3a35" fontSize="8" fontWeight="700">
							{value.toUpperCase()}
						</text>
					</g>
				))}
				<text
					x={MARGIN}
					y="176"
					fill="#3b3a35"
					fontFamily="ui-monospace, monospace"
					fontSize="9"
					lengthAdjust="spacing"
					opacity="0.8"
					textLength={VISA_WIDTH - MARGIN * 2}
				>
					{visaMrzOf(achievement, design)}
				</text>
				<rect
					width={VISA_WIDTH}
					height={VISA_HEIGHT}
					rx="6"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
					opacity="0.6"
				/>
			</g>
		</svg>
	);
});
Visa.displayName = "Visa";
