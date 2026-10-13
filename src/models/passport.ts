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
	/** How many achievements the map has earned a visa for, of how many there are. */
	readonly visas: number;
	readonly visaTotal: number;
}

/**
 * A page of the passport: the cover, the identity page, then its visas, if it has earned any, and
 * its stamps, a page of each numbered from 0 out of how many there are.
 */
export type PassportPage =
	| { readonly kind: "cover" }
	| { readonly kind: "identity" }
	| { readonly kind: "stamps"; readonly index: number; readonly of: number }
	| { readonly kind: "visas"; readonly index: number; readonly of: number };

/** How many stamps a page of the passport holds. */
export const STAMPS_PER_PAGE = 6;

/** A country that has just been stamped, which the stamp moment plays out for. */
export interface StampMoment {
	readonly code: string;
	/** Counts up with every stamp, so stamping the same country twice plays the moment twice. */
	readonly id: number;
	/** The achievements the tick has just earned, whose visas follow the stamp in. */
	readonly visas: readonly string[];
}
