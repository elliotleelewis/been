import { memo } from "react";
import type { FC } from "react";

interface Props {
	/** The country's outline as an SVG path in a 100-unit square, or empty where there is none. */
	readonly silhouette: string;
	/** The country's ISO 3166-1 alpha-2 code, which stands in for an outline it has none of. */
	readonly code: string;
}

/**
 * The middle of a stamp, in a 100-unit square: the country's outline, or, for a country too small
 * for the atlas to draw as more than a point, an emblem of its code in a ring, so the stamp is
 * never left empty.
 */
export const StampSilhouette: FC<Props> = memo(({ code, silhouette }) =>
	silhouette === "" ? (
		<g fill="currentColor">
			<circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="5" />
			<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
			<text
				x="50"
				y="50"
				dominantBaseline="central"
				fontSize="34"
				fontWeight="800"
				letterSpacing="2"
				textAnchor="middle"
			>
				{code}
			</text>
		</g>
	) : (
		<path d={silhouette} fill="currentColor" />
	),
);
StampSilhouette.displayName = "StampSilhouette";
