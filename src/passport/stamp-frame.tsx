import { memo } from "react";
import type { FC, ReactElement } from "react";

import type { StampShape } from "./types.ts";

interface Props {
	readonly shape: StampShape;
}

/** The points of a regular octagon of `radius` about the middle of a stamp, flat side up. */
const octagon = (radius: number): string =>
	Array.from({ length: 8 }, (_point, index) => {
		const angle = ((index + 0.5) * Math.PI) / 4;
		return `${String(60 + radius * Math.cos(angle))},${String(60 + radius * Math.sin(angle))}`;
	}).join(" ");

/** Each shape's double border, a heavy outer line and a fine inner one, in a 120-unit square. */
const FRAMES: Readonly<Record<StampShape, ReactElement>> = {
	circle: (
		<>
			<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
			<circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1.2" />
		</>
	),
	octagon: (
		<>
			<polygon points={octagon(57)} fill="none" stroke="currentColor" strokeWidth="3" />
			<polygon points={octagon(48)} fill="none" stroke="currentColor" strokeWidth="1.2" />
		</>
	),
	oval: (
		<>
			<ellipse cx="60" cy="60" rx="57" ry="43" fill="none" stroke="currentColor" strokeWidth="3" />
			<ellipse
				cx="60"
				cy="60"
				rx="45"
				ry="31"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
		</>
	),
	rectangle: (
		<>
			<rect
				x="5"
				y="20"
				width="110"
				height="80"
				rx="7"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
			/>
			<rect
				x="10"
				y="25"
				width="100"
				height="70"
				rx="4"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
		</>
	),
};

/** A stamp's double border, in the stamp's ink. */
export const StampFrame: FC<Props> = memo(({ shape }) => FRAMES[shape]);
StampFrame.displayName = "StampFrame";
