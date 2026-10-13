import type { PassportStats } from "../models/passport";

/** How many characters each line of a passport's machine-readable zone holds. */
const MRZ_LENGTH = 44;
const MRZ_FILLER = "<";

/** Text as a machine-readable zone writes it: capitals and digits, with fillers for the rest. */
const mrzText = (text: string): string =>
	text
		.normalize("NFD")
		.replaceAll(/\p{M}/gu, "")
		.toUpperCase()
		.replaceAll(/[^A-Z0-9]+/gu, MRZ_FILLER);

/** One line of the zone, cut or filled out to its fixed length. */
const mrzLine = (fields: readonly string[]): string =>
	fields
		.map((field) => mrzText(field))
		.join(MRZ_FILLER.repeat(2))
		.padEnd(MRZ_LENGTH, MRZ_FILLER)
		.slice(0, MRZ_LENGTH);

/**
 * The two lines along the foot of the identity page, written the way a real passport's
 * machine-readable zone is, out of the map's own numbers. Nothing reads them: they are there to be
 * noticed.
 */
export const mrzOf = (stats: PassportStats): readonly [string, string] => [
	mrzLine(["P", "BEEN", `${String(stats.count).padStart(3, "0")} COUNTRIES`]),
	mrzLine([`${String(stats.regions)} REGIONS`, stats.home ?? "", `OF ${String(stats.total)}`]),
];

/**
 * The font size that fits `text` into `room` SVG units of a stamp, at most `largest`, given the
 * bold capitals stamps are lettered in run to about two thirds of an em each.
 */
export const fontSizeFor = (text: string, room: number, largest: number): number =>
	Math.min(largest, room / Math.max(text.length * 0.68, 1));
