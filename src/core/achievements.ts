import { ISLAND_NATIONS, LANDLOCKED, MICROSTATES } from "../data/collections.ts";
import { m } from "../paraglide/messages.js";
import { M49_REGIONS, M49_REGION_CODES, M49_SUBREGIONS } from "./m49.ts";
import type { Achievement, AchievementTier, CountryData, Requirement, Visits } from "./types.ts";

/** The counts of countries that earn a milestone, short of every country there is. */
const MILESTONES: readonly number[] = [10, 25, 50, 100, 150];
/** The milestones that earn a foil visa, and those that earn a legendary one, by count. */
const FOIL_MILESTONE = 100;
const LEGENDARY_MILESTONE = 150;
/**
 * The sub-regions that earn a foil visa: the Pacific's three, scattered over an ocean so wide that
 * completing one takes more travel than completing some continents.
 */
const FOIL_SUBREGIONS: ReadonlySet<string> = new Set(["054", "057", "061"]);

/** The tier of the milestone for `count` countries. */
const milestoneTierOf = (count: number): AchievementTier => {
	if (count >= LEGENDARY_MILESTONE) {
		return "legendary";
	}
	return count >= FOIL_MILESTONE ? "foil" : "standard";
};
/** How many of a large collection, such as the island nations, earn its achievement. */
const COLLECTION_COUNT = 5;

const TURN_DEGREES = 360;

/** Every one of `codes`. */
const allOf = (codes: readonly string[]): Requirement => ({ codes, count: codes.length });
/** At least one of `codes`, which an achievement asking for more than one part of calls `label`. */
const anyOf = (codes: readonly string[], label?: string): Requirement =>
	label === undefined ? { codes, count: 1 } : { codes, count: 1, label };

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
		tier: "standard",
		title: m.achievement_first_title(),
	},
	...MILESTONES.filter((count) => count < codes.length).map((count): Achievement => ({
		description: m.achievement_count_description({ count }),
		id: `milestone:${String(count)}`,
		kind: "milestone",
		requirements: [{ codes, count }],
		tier: milestoneTierOf(count),
		title: m.achievement_count_title({ count }),
	})),
	{
		description: m.achievement_world_description(),
		id: "milestone:all",
		kind: "milestone",
		requirements: [allOf(codes)],
		tier: "legendary",
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
		tier: "foil",
		title: M49_REGIONS[region](),
	}));

/** A stamp from each of the five continents, which a list missing any of them cannot earn. */
const continentsOf = (countries: readonly CountryData[]): Achievement => ({
	description: m.achievement_continents_description(),
	id: "geography:continents",
	kind: "geography",
	requirements: M49_REGION_CODES.map((region) =>
		anyOf(
			codesWhere(countries, (country) => country.region === region),
			M49_REGIONS[region](),
		),
	),
	tier: "foil",
	title: m.achievement_continents_title(),
});

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
							tier: FOIL_SUBREGIONS.has(subregion) ? "foil" : "standard",
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
			requirements: [anyOf(north, m.achievement_north()), anyOf(south, m.achievement_south())],
			tier: "standard",
			title: m.achievement_equator_sides_title(),
		},
		{
			description: m.achievement_meridian_sides_description(),
			id: "geography:meridian-sides",
			kind: "geography",
			requirements: [anyOf(east, m.achievement_east()), anyOf(west, m.achievement_west())],
			tier: "standard",
			title: m.achievement_meridian_sides_title(),
		},
		{
			description: m.achievement_hemispheres_description(),
			id: "geography:hemispheres",
			kind: "geography",
			requirements: [
				anyOf(north, m.achievement_north()),
				anyOf(south, m.achievement_south()),
				anyOf(east, m.achievement_east()),
				anyOf(west, m.achievement_west()),
			],
			tier: "standard",
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
			tier: "standard",
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
			tier: "standard",
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
		tier: "foil",
		title: m.achievement_microstates_title(),
	},
	{
		description: m.achievement_islands_description({ count: COLLECTION_COUNT }),
		id: "collection:islands",
		kind: "collection",
		requirements: [{ codes: ISLAND_NATIONS, count: COLLECTION_COUNT }],
		tier: "standard",
		title: m.achievement_islands_title(),
	},
	{
		description: m.achievement_landlocked_description({ count: COLLECTION_COUNT }),
		id: "collection:landlocked",
		kind: "collection",
		requirements: [{ codes: LANDLOCKED, count: COLLECTION_COUNT }],
		tier: "standard",
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
				continentsOf(countries),
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

/** How many more countries an achievement needs, across all its requirements. */
export const remainingFor = (achievement: Achievement, visits: Visits): number =>
	achievement.requirements.reduce(
		(total, { codes, count }) =>
			total + Math.max(0, count - codes.filter((code) => Object.hasOwn(visits, code)).length),
		0,
	);

/** How many countries an achievement asks for in all. */
export const requiredFor = (achievement: Achievement): number =>
	achievement.requirements.reduce((total, { count }) => total + count, 0);

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
