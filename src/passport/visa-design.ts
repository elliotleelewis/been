import { hashOf } from "../core/hash.ts";
import { STAMP_INKS, VISA_INKS, VISA_TYPES } from "./types.ts";
import type { Achievement, VisaDesign } from "./types.ts";

/** The furthest a visa is turned either way, in tenths of a degree. */
const MAX_ROTATION_TENTHS = 15;
const SERIAL_DIGITS = 7;
const SEEDS = 997;

/** How many characters the line along a visa's foot holds. */
const MRZ_LENGTH = 36;
const MRZ_FILLER = "<";

/**
 * How an achievement's visa looks, worked out from its id alone, so it is the same every time.
 * Continents and sub-regions are printed in their region's stamp ink, everything else in its own.
 */
export const visaDesignOf = ({ id, kind, region }: Achievement): VisaDesign => {
	const hash = hashOf(`visa:${id}`);
	const ink =
		kind === "region" || kind === "subregion" ? STAMP_INKS[region ?? "150"] : VISA_INKS[kind];
	return {
		ink,
		rotation: ((hash % (MAX_ROTATION_TENTHS * 2 + 1)) - MAX_ROTATION_TENTHS) / 10,
		seed: hash % SEEDS,
		serial: String(hash).padStart(SERIAL_DIGITS, "0").slice(-SERIAL_DIGITS),
		type: VISA_TYPES[kind],
	};
};

/**
 * The line along a visa's foot, written as a machine-readable zone would write it. Nothing reads
 * it; like the one on the identity page, it is there to be noticed.
 */
export const visaMrzOf = ({ title }: Achievement, { serial }: VisaDesign): string =>
	["V", "BEEN", title, serial]
		.map((field) =>
			field
				.normalize("NFD")
				.replaceAll(/\p{M}/gu, "")
				.toUpperCase()
				.replaceAll(/[^A-Z0-9]+/gu, MRZ_FILLER),
		)
		.join(MRZ_FILLER.repeat(2))
		.padEnd(MRZ_LENGTH, MRZ_FILLER)
		.slice(0, MRZ_LENGTH);
