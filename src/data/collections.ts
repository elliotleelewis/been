// Hand-kept lists of countries some achievements ask for, by ISO 3166-1 alpha-2 code. Unlike the
// country list these are not generated: no source the app already draws on records them.

/**
 * Europe's six microstates, as the term is usually meant: the smallest sovereign states on the
 * continent, each a city, a valley or an island or two.
 */
export const MICROSTATES: readonly string[] = ["AD", "LI", "MC", "MT", "SM", "VA"];

/**
 * The 44 countries with no coast on the open sea, by the usual count, which treats the Caspian as a
 * lake, so Azerbaijan, Kazakhstan and Turkmenistan are among them.
 */
export const LANDLOCKED: readonly string[] = [
	// Africa
	"BF",
	"BI",
	"BW",
	"CF",
	"ET",
	"LS",
	"ML",
	"MW",
	"NE",
	"RW",
	"SS",
	"SZ",
	"TD",
	"UG",
	"ZM",
	"ZW",
	// Asia
	"AF",
	"AM",
	"AZ",
	"BT",
	"KG",
	"KZ",
	"LA",
	"MN",
	"NP",
	"TJ",
	"TM",
	"UZ",
	// Europe
	"AD",
	"AT",
	"BY",
	"CH",
	"CZ",
	"HU",
	"LI",
	"LU",
	"MD",
	"MK",
	"RS",
	"SK",
	"SM",
	"VA",
	// South America
	"BO",
	"PY",
];

/**
 * Countries made up wholly of islands, including those that share an island with a neighbour, such
 * as Haiti and Ireland. Australia is a continent, so it is not one, and nor are countries with a
 * foothold on a mainland, such as Malaysia or Denmark.
 */
export const ISLAND_NATIONS: readonly string[] = [
	"AG",
	"BB",
	"BH",
	"BS",
	"CU",
	"CV",
	"CY",
	"DM",
	"DO",
	"FJ",
	"FM",
	"GB",
	"GD",
	"HT",
	"ID",
	"IE",
	"IS",
	"JM",
	"JP",
	"KI",
	"KM",
	"KN",
	"LC",
	"LK",
	"MG",
	"MH",
	"MT",
	"MU",
	"MV",
	"NR",
	"NZ",
	"PG",
	"PH",
	"PW",
	"SB",
	"SC",
	"SG",
	"ST",
	"TL",
	"TO",
	"TT",
	"TV",
	"VC",
	"VU",
	"WS",
];
