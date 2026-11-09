import type { M49Region } from "../core/m49.ts";

/**
 * The square each continent's bar is filled with in the emoji summary: the colour its stamps are
 * inked in in the passport, as near as emoji come to it.
 */
export const REGION_SQUARES: Readonly<Record<M49Region, string>> = {
	"002": "🟩",
	"009": "🟫",
	"019": "🟦",
	"142": "🟥",
	"150": "🟪",
};

/** The square a bar is filled out with past a continent's visits. */
export const EMPTY_SQUARE = "⬜";

/** How many squares long a continent's bar is: one for every tenth of it. */
export const BAR_LENGTH = 10;
