// Areas of the UN M49 standard, by their numeric code, with their English names as M49 gives them.
// Countries are named in the reader's language by `Intl.DisplayNames`, but browsers do not all
// carry names for these areas, so the app holds them itself. They are English only for now.

/** Africa, the Americas, Asia, Europe and Oceania. */
export const M49_REGIONS = {
	"002": "Africa",
	"009": "Oceania",
	"019": "Americas",
	"142": "Asia",
	"150": "Europe",
} as const;

/**
 * The most specific grouping M49 gives inside a region: its intermediate region where it has one,
 * such as South America (005), otherwise its sub-region, such as Northern America (021).
 */
export const M49_SUBREGIONS = {
	"005": "South America",
	"011": "Western Africa",
	"013": "Central America",
	"014": "Eastern Africa",
	"015": "Northern Africa",
	"017": "Middle Africa",
	"018": "Southern Africa",
	"021": "Northern America",
	"029": "Caribbean",
	"030": "Eastern Asia",
	"034": "Southern Asia",
	"035": "South-eastern Asia",
	"039": "Southern Europe",
	"053": "Australia and New Zealand",
	"054": "Melanesia",
	"057": "Micronesia",
	"061": "Polynesia",
	"143": "Central Asia",
	"145": "Western Asia",
	"151": "Eastern Europe",
	"154": "Northern Europe",
	"155": "Western Europe",
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
