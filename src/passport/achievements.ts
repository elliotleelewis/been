import { M49_REGIONS, M49_REGION_CODES, M49_SUBREGIONS } from "../core/m49.ts";
import type { CountryData, Visits } from "../core/types.ts";
import { ISLAND_NATIONS, LANDLOCKED, MICROSTATES } from "../data/collections.ts";
import { m } from "../paraglide/messages.js";
import type { Achievement, Requirement } from "./types.ts";

/** The counts of countries that earn a milestone, short of every country there is. */
const MILESTONES: readonly number[] = [10, 25, 50, 100, 150];
/** How many of a large collection, such as the island nations, earn its achievement. */
const COLLECTION_COUNT = 5;

const TURN_DEGREES = 360;

/** Every one of `codes`. */
const allOf = (codes: readonly string[]): Requirement => ({ codes, count: codes.length });
/** At least one of `codes`. */
const anyOf = (codes: readonly string[]): Requirement => ({ codes, count: 1 });

const codesWhere = (
	countries: readonly CountryData[],
	test: (country: CountryData) => boolean,
): readonly string[] => countries.filter((country) => test(country)).map(({ iso3166 }) => iso3166);

/** The latitude and longitude at the middle of a country's box, its longitude back within ±180. */
const middleOf = ({ bounds }: CountryData): readonly [number, number] | undefined => {
	if (bounds === undefined) {
		return undefined;
	}
	const [west, south, east, north] = bounds;
	const longitude = (west + east) / 2;
	return [(south + north) / 2, longitude > TURN_DEGREES / 2 ? longitude - TURN_DEGREES : longitude];
};

const milestonesOf = (codes: readonly string[]): readonly Achievement[] => [
	{
		description: m.achievement_first_description(),
		id: "milestone:1",
		kind: "milestone",
		requirements: [{ codes, count: 1 }],
		title: m.achievement_first_title(),
	},
	...MILESTONES.filter((count) => count < codes.length).map((count): Achievement => ({
		description: m.achievement_count_description({ count }),
		id: `milestone:${String(count)}`,
		kind: "milestone",
		requirements: [{ codes, count }],
		title: m.achievement_count_title({ count }),
	})),
	{
		description: m.achievement_world_description(),
		id: "milestone:all",
		kind: "milestone",
		requirements: [allOf(codes)],
		title: m.achievement_world_title(),
	},
];

const regionsOf = (countries: readonly CountryData[]): readonly Achievement[] =>
	M49_REGION_CODES.map((region) => ({
		description: m.achievement_area_description({ area: M49_REGIONS[region]() }),
		id: `region:${region}`,
		kind: "region",
		region,
		requirements: [allOf(codesWhere(countries, (country) => country.region === region))],
		title: M49_REGIONS[region](),
	}));

const subregionsOf = (countries: readonly CountryData[]): readonly Achievement[] =>
	[...new Set(countries.map(({ subregion }) => subregion))]
		.toSorted()
		.flatMap((subregion): Achievement[] => {
			const members = countries.filter((country) => country.subregion === subregion);
			const region = members[0]?.region;
			return region === undefined
				? []
				: [
						{
							description: m.achievement_area_description({
								area: M49_SUBREGIONS[subregion](),
							}),
							id: `subregion:${subregion}`,
							kind: "subregion",
							region,
							requirements: [allOf(members.map(({ iso3166 }) => iso3166))],
							title: M49_SUBREGIONS[subregion](),
						},
					];
		});

/**
 * Achievements about where on the globe countries lie, read off their boxes. Which hemisphere a
 * country is in goes by the middle of its box, so that crossing the equator takes two countries,
 * not one that the equator runs through.
 */
const geographyOf = (countries: readonly CountryData[]): readonly Achievement[] => {
	const north = codesWhere(countries, (country) => (middleOf(country)?.[0] ?? 0) > 0);
	const south = codesWhere(countries, (country) => (middleOf(country)?.[0] ?? 0) < 0);
	const east = codesWhere(countries, (country) => (middleOf(country)?.[1] ?? 0) > 0);
	const west = codesWhere(countries, (country) => (middleOf(country)?.[1] ?? 0) < 0);
	return [
		{
			description: m.achievement_equator_sides_description(),
			id: "geography:equator-sides",
			kind: "geography",
			requirements: [anyOf(north), anyOf(south)],
			title: m.achievement_equator_sides_title(),
		},
		{
			description: m.achievement_meridian_sides_description(),
			id: "geography:meridian-sides",
			kind: "geography",
			requirements: [anyOf(east), anyOf(west)],
			title: m.achievement_meridian_sides_title(),
		},
		{
			description: m.achievement_hemispheres_description(),
			id: "geography:hemispheres",
			kind: "geography",
			requirements: [anyOf(north), anyOf(south), anyOf(east), anyOf(west)],
			title: m.achievement_hemispheres_title(),
		},
		{
			description: m.achievement_equator_description(),
			id: "geography:equator",
			kind: "geography",
			requirements: [
				anyOf(
					codesWhere(
						countries,
						({ bounds }) => bounds !== undefined && bounds[1] < 0 && bounds[3] > 0,
					),
				),
			],
			title: m.achievement_equator_title(),
		},
		{
			description: m.achievement_date_line_description(),
			id: "geography:date-line",
			kind: "geography",
			requirements: [
				anyOf(
					codesWhere(
						countries,
						({ bounds }) => bounds !== undefined && bounds[2] > TURN_DEGREES / 2,
					),
				),
			],
			title: m.achievement_date_line_title(),
		},
	];
};

const collectionsOf = (): readonly Achievement[] => [
	{
		description: m.achievement_microstates_description(),
		id: "collection:microstates",
		kind: "collection",
		requirements: [allOf(MICROSTATES)],
		title: m.achievement_microstates_title(),
	},
	{
		description: m.achievement_islands_description({ count: COLLECTION_COUNT }),
		id: "collection:islands",
		kind: "collection",
		requirements: [{ codes: ISLAND_NATIONS, count: COLLECTION_COUNT }],
		title: m.achievement_islands_title(),
	},
	{
		description: m.achievement_landlocked_description({ count: COLLECTION_COUNT }),
		id: "collection:landlocked",
		kind: "collection",
		requirements: [{ codes: LANDLOCKED, count: COLLECTION_COUNT }],
		title: m.achievement_landlocked_title(),
	},
];

/**
 * Every achievement there is for a list of countries: milestones of how many, each continent and
 * sub-region complete, where on the globe they lie, and a few collections. Any that would ask for
 * nothing, such as a region the list has no countries in, or for a country the list does not
 * have, is left out.
 */
export const achievementsOf = (countries: readonly CountryData[]): readonly Achievement[] => {
	const codes = countries.map(({ iso3166 }) => iso3166);
	return codes.length === 0
		? []
		: [
				...milestonesOf(codes),
				...regionsOf(countries),
				...subregionsOf(countries),
				...geographyOf(countries),
				...collectionsOf(),
			].filter(({ requirements }) =>
				requirements.every(
					({ codes: required, count }) =>
						count > 0 && required.length >= count && required.every((code) => codes.includes(code)),
				),
			);
};

/** Whether `visits` meet every one of an achievement's requirements. */
export const isEarned = ({ requirements }: Achievement, visits: Visits): boolean =>
	requirements.every(
		({ codes, count }) => codes.filter((code) => Object.hasOwn(visits, code)).length >= count,
	);

/**
 * The day an earned achievement was earned, as an ISO 8601 date: the day of the tick that met the
 * last of its requirements. Ticks older than dates being kept count as the earliest of all, so an
 * achievement they alone earned has no date.
 */
export const earnedOn = ({ requirements }: Achievement, visits: Visits): string | undefined => {
	const days = requirements.map(
		({ codes, count }) =>
			codes
				.filter((code) => Object.hasOwn(visits, code))
				.map((code) => visits[code]?.at ?? "")
				.toSorted()[count - 1] ?? "",
	);
	const last = days.toSorted().at(-1);
	return last === "" ? undefined : last;
};

/** The achievements ticking `code` has just earned, which the visits without it had not. */
export const newlyEarned = (
	achievements: readonly Achievement[],
	visits: Visits,
	code: string,
): readonly Achievement[] => {
	const { [code]: _ticked, ...before } = visits;
	return achievements.filter(
		(achievement) => isEarned(achievement, visits) && !isEarned(achievement, before),
	);
};
