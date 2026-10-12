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
