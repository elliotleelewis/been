import type { Country } from "./country";
import type { StampDesign } from "./stamp";

/** A country's stamp in the passport. */
export interface PassportStamp {
	readonly country: Country;
	readonly design: StampDesign;
	/** The day the stamp is dated, as the reader writes dates, or none for an older tick. */
	readonly date: string | undefined;
	/** The country's outline as an SVG path in a 100-unit square, once the atlas has loaded. */
	readonly silhouette: string | undefined;
}

/** What the passport's identity page says about the map it belongs to. */
export interface PassportStats {
	readonly count: number;
	readonly total: number;
	/** How many of the M49 regions have at least one stamp. */
	readonly regions: number;
	/** The name of the reader's home region, where there is a guess at one. */
	readonly home: string | undefined;
	readonly first: string | undefined;
	readonly latest: string | undefined;
}

/** How many stamps a page of the passport holds. */
export const STAMPS_PER_PAGE = 6;

/** A country that has just been stamped, which the stamp moment plays out for. */
export interface StampMoment {
	readonly code: string;
	/** Counts up with every stamp, so stamping the same country twice plays the moment twice. */
	readonly id: number;
}
