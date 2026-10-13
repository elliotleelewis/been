import { memo, useId } from "react";
import type { FC } from "react";

import { fontSizeFor } from "./lettering.ts";
import { StampFrame } from "./stamp-frame.tsx";
import { StampText } from "./stamp-text.tsx";
import type { PassportStamp, StampShape } from "./types.ts";

interface Props {
	readonly stamp: PassportStamp;
}

/** Where a line of a stamp's lettering runs: along an arc of its rim, or straight across. */
export type StampLine =
	| { readonly arc: string; readonly room: number }
	| { readonly baseline: number; readonly room: number };

interface StampLayout {
	/** The box the country's silhouette is drawn into: left, top, width and height. */
	readonly silhouette: readonly [number, number, number, number];
	readonly name: StampLine;
	readonly footer: StampLine;
}

/**
 * Where everything sits on each shape of stamp, in a 120-unit square. Arcs run left to right, so the
 * lettering along the foot of a round stamp reads the right way up.
 */
const LAYOUTS: Readonly<Record<StampShape, StampLayout>> = {
	circle: {
		footer: { arc: "M 7 60 A 53 53 0 0 0 113 60", room: 150 },
		name: { arc: "M 13 60 A 47 47 0 0 1 107 60", room: 140 },
		silhouette: [33, 33, 54, 54],
	},
	octagon: {
		footer: { baseline: 90, room: 66 },
		name: { baseline: 36, room: 66 },
		silhouette: [34, 41, 52, 42],
	},
	oval: {
		footer: { arc: "M 7 60 A 53 39 0 0 0 113 60", room: 140 },
		name: { arc: "M 13 60 A 47 33 0 0 1 107 60", room: 128 },
		silhouette: [36, 39, 48, 42],
	},
	rectangle: {
		footer: { baseline: 90, room: 90 },
		name: { baseline: 39, room: 90 },
		silhouette: [33, 43, 54, 40],
	},
};

/** The largest lettering a stamp's name and its foot are set in, in SVG units. */
const NAME_SIZE = 10;
const FOOTER_SIZE = 7;

/**
 * A passport stamp for a country: a double border in one of a few shapes, the country's own outline
 * in the middle, and its name, the word it was stamped with and the date around it, all pressed at
 * a slant in its region's ink. The ink is broken up with noise, as rubber stamps never print solid.
 */
export const Stamp: FC<Props> = memo(({ stamp }) => {
	const id = useId();
	const { caption, ink, rotation, seed, shape } = stamp.design;
	const layout = LAYOUTS[shape];
	const [left, top, width, height] = layout.silhouette;
	const name = stamp.country.name.toUpperCase();
	const footer = stamp.date === undefined ? caption : `${caption} · ${stamp.date}`;

	return (
		<svg className="size-full overflow-visible" viewBox="0 0 120 120" aria-hidden="true">
			<filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.9"
					numOctaves="2"
					seed={seed}
					result="speckle"
				/>
				<feColorMatrix
					in="speckle"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 0 0 0 1.45"
					result="mask"
				/>
				<feComposite in="SourceGraphic" in2="mask" operator="in" result="inked" />
				<feTurbulence type="fractalNoise" baseFrequency="0.06" seed={seed + 1} result="warp" />
				<feDisplacementMap
					in="inked"
					in2="warp"
					scale="2.5"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
			<g
				color={ink}
				filter={`url(#${id}-ink)`}
				opacity="0.88"
				transform={`rotate(${String(rotation)} 60 60)`}
			>
				<StampFrame shape={shape} />
				{stamp.silhouette === undefined ? null : (
					<svg x={left} y={top} width={width} height={height} viewBox="0 0 100 100">
						<path d={stamp.silhouette} fill="currentColor" />
					</svg>
				)}
				<StampText
					id={`${id}-name`}
					line={layout.name}
					size={fontSizeFor(name, layout.name.room, NAME_SIZE)}
					text={name}
				/>
				<StampText
					id={`${id}-footer`}
					line={layout.footer}
					size={fontSizeFor(footer, layout.footer.room, FOOTER_SIZE)}
					text={footer}
				/>
			</g>
		</svg>
	);
});
Stamp.displayName = "Stamp";
