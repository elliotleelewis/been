import { memo, useMemo } from "react";
import type { FC } from "react";

import { rosettePath, wavePath } from "./guilloche.ts";
import { VISA_WIDTH } from "./types.ts";

interface Props {
	/** Picks the pattern, so no two visas are printed with the same one. */
	readonly seed: number;
}

const WAVE_COUNT = 14;
const WAVE_TOP = 34;
const WAVE_GAP = 10;
const ROSETTE_COUNT = 10;
/** The medallion's middle and outer radius, at the visa's left. */
const MEDALLION: readonly [number, number, number] = [58, 104, 38];

/**
 * The fine line-work a visa is printed over, in its ink: a field of waves across it and a rosette
 * medallion at its left with a globe at its heart, each woven from curves drawn a little apart,
 * and each shaped by `seed`.
 */
export const VisaPattern: FC<Props> = memo(({ seed }) => {
	const waves = useMemo(
		() =>
			Array.from({ length: WAVE_COUNT }, (_wave, index) =>
				wavePath(
					[VISA_WIDTH, WAVE_TOP + index * WAVE_GAP],
					[3 + (seed % 4), 3 + (seed % 3)],
					index * 0.45,
				),
			),
		[seed],
	);
	const rosettes = useMemo(
		() =>
			Array.from({ length: ROSETTE_COUNT }, (_rosette, index) =>
				rosettePath(MEDALLION, [9 + (seed % 8), 5], (index / ROSETTE_COUNT) * Math.PI),
			),
		[seed],
	);
	const [across, down, radius] = MEDALLION;

	return (
		<g fill="none" stroke="currentColor">
			<g opacity="0.16" strokeWidth="0.5">
				{waves.map((path) => (
					<path key={path} d={path} />
				))}
			</g>
			<circle cx={across} cy={down} r={radius + 7} fill="#fbf7ec" opacity="0.9" stroke="none" />
			<g opacity="0.5" strokeWidth="0.45">
				{rosettes.map((path) => (
					<path key={path} d={path} />
				))}
			</g>
			<g strokeWidth="1.3" opacity="0.85">
				<circle cx={across} cy={down} r="15" />
				<ellipse cx={across} cy={down} rx="6.5" ry="15" />
				<path d={`M${String(across - 15)} ${String(down)}h30`} />
			</g>
		</g>
	);
});
VisaPattern.displayName = "VisaPattern";
