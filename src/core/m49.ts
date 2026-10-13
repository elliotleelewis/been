// Areas of the UN M49 standard, by their numeric code, each with the message that names it.
// Countries are named in the reader's language by `Intl.DisplayNames`, but browsers do not all
// carry names for these areas, so the app's messages hold them instead.
import { m } from "../paraglide/messages.js";

/** Africa, the Americas, Asia, Europe and Oceania. */
export const M49_REGIONS = {
	"002": m.m49_africa,
	"009": m.m49_oceania,
	"019": m.m49_americas,
	"142": m.m49_asia,
	"150": m.m49_europe,
} as const;

/**
 * The most specific grouping M49 gives inside a region: its intermediate region where it has one,
 * such as South America (005), otherwise its sub-region, such as Northern America (021).
 */
export const M49_SUBREGIONS = {
	"005": m.m49_south_america,
	"011": m.m49_western_africa,
	"013": m.m49_central_america,
	"014": m.m49_eastern_africa,
	"015": m.m49_northern_africa,
	"017": m.m49_middle_africa,
	"018": m.m49_southern_africa,
	"021": m.m49_northern_america,
	"029": m.m49_caribbean,
	"030": m.m49_eastern_asia,
	"034": m.m49_southern_asia,
	"035": m.m49_south_eastern_asia,
	"039": m.m49_southern_europe,
	"053": m.m49_australia_and_new_zealand,
	"054": m.m49_melanesia,
	"057": m.m49_micronesia,
	"061": m.m49_polynesia,
	"143": m.m49_central_asia,
	"145": m.m49_western_asia,
	"151": m.m49_eastern_europe,
	"154": m.m49_northern_europe,
	"155": m.m49_western_europe,
} as const;

export type M49Region = keyof typeof M49_REGIONS;
export type M49Subregion = keyof typeof M49_SUBREGIONS;

export const isM49Region = (value: unknown): value is M49Region =>
	typeof value === "string" && Object.hasOwn(M49_REGIONS, value);

/**
 * Sorted, because `Object.keys` lists the codes that read as whole numbers, such as 142, ahead of
 * the zero-padded ones, such as 002.
 */
export const M49_REGION_CODES: readonly M49Region[] = Object.keys(M49_REGIONS)
	.filter((code) => isM49Region(code))
	.toSorted();

/**
 * Whether a value read back from storage is the list of continents the menu has open, or the
 * `null` that stands for "the reader has not chosen yet".
 */
export const isExpandedRegions = (value: unknown): value is readonly M49Region[] | null =>
	value === null || (Array.isArray(value) && value.every((code) => isM49Region(code)));

/**
 * The first part of an IANA time zone name, mapped to the M49 region it mostly sits in. Zones
 * named after an ocean, such as `Atlantic/Reykjavik` or `Indian/Mauritius`, span more than one
 * region, so they are left out rather than guessed at.
 */
const TIME_ZONE_REGIONS: Readonly<Record<string, M49Region>> = {
	Africa: "002",
	America: "019",
	Asia: "142",
	Australia: "009",
	Europe: "150",
	Pacific: "009",
};

/**
 * A best guess at the reader's home region from their time zone, which says where they are without
 * asking. It only decides which continent the menu opens first, so a wrong guess costs little.
 */
export const homeRegionOf = (timeZone: string): M49Region | undefined => {
	const [area] = timeZone.split("/");
	return area === undefined ? undefined : TIME_ZONE_REGIONS[area];
};
