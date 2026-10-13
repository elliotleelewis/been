import { memo } from "react";
import type { FC } from "react";

import type { StampLine } from "./stamp";

interface Props {
	/** Names the arc the text runs along, unique to the stamp it is in. */
	readonly id: string;
	readonly line: StampLine;
	readonly size: number;
	readonly text: string;
}

/** A line of a stamp's lettering, centred along an arc of its rim or straight across it. */
export const StampText: FC<Props> = memo(({ id, line, size, text }) =>
	"arc" in line ? (
		<>
			<path id={id} d={line.arc} fill="none" />
			<text
				fill="currentColor"
				fontSize={size}
				fontWeight="700"
				letterSpacing="0.6"
				textAnchor="middle"
			>
				<textPath href={`#${id}`} startOffset="50%">
					{text}
				</textPath>
			</text>
		</>
	) : (
		<text
			x="60"
			y={line.baseline}
			fill="currentColor"
			fontSize={size}
			fontWeight="700"
			letterSpacing="0.6"
			textAnchor="middle"
		>
			{text}
		</text>
	),
);
StampText.displayName = "StampText";
