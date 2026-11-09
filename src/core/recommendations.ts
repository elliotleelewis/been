import type {
	Achievement,
	AchievementTier,
	CountryData,
	Recommendation,
	RecommendationReason,
	Visits,
} from "./types.ts";

/** How many countries are recommended at a time: a few to choose between, not a list to work through. */
export const RECOMMENDATION_COUNT = 5;

/** How much more a rarer achievement draws a country towards it. */
const TIER_WEIGHTS: Readonly<Record<AchievementTier, number>> = {
	foil: 1.5,
	legendary: 2,
	standard: 1,
};
/** How much bordering a country already visited counts, as a trip that could be stretched. */
const NEIGHBOUR_WEIGHT = 0.6;
/** How much being a continent's first counts, as somewhere new altogether. */
const NEW_REGION_WEIGHT = 0.5;
/**
 * How much of its reasons a country on the far side of the world keeps, against all of them for one
 * on the doorstep of somewhere already visited, as the nearer is the likelier trip: a country
 * across the world needs twice the reason a neighbour does to be recommended over it.
 */
const FARTHEST_SHARE = 0.5;
const TURN_DEGREES = 360;
const RADIANS = Math.PI / 180;

/** A reason, and how much it counts towards recommending its country. */
interface Weighed {
	readonly code: string;
	readonly reason: RecommendationReason;
	readonly weight: number;
}

const isVisited = (visits: Visits, code: string): boolean => Object.hasOwn(visits, code);

/**
 * How much each country it could still use counts towards an achievement not yet earned: its share
 * of one of the achievement's requirements, which is how many that still needs over how many could
 * still fill it, so the one country left to complete a continent counts for all of it, and one of
 * the sixty south of the equator for very little.
 */
const sharesOf = (achievement: Achievement, visits: Visits): ReadonlyMap<string, number> => {
	const shares = new Map<string, number>();
	for (const { codes, count } of achievement.requirements) {
		const open = codes.filter((code) => !isVisited(visits, code));
		const need = count - (codes.length - open.length);
		for (const code of need > 0 ? open : []) {
			shares.set(code, Math.max(shares.get(code) ?? 0, need / open.length));
		}
	}
	return shares;
};

/** How many more countries an achievement needs, across all its requirements. */
const remainingFor = (achievement: Achievement, visits: Visits): number =>
	achievement.requirements.reduce(
		(total, { codes, count }) =>
			total + Math.max(0, count - codes.filter((code) => isVisited(visits, code)).length),
		0,
	);

/**
 * What every achievement not yet earned still asks for, by country: each country's share of it, by
 * its rarity, over how many it still needs, so one country short of a rare visa counts for most.
 * Milestones are left out: any country at all counts towards them, so they would only say what is
 * true of every country.
 */
const achievementReasonsOf = (achievements: readonly Achievement[], visits: Visits): Weighed[] =>
	achievements
		.filter(({ kind }) => kind !== "milestone")
		.flatMap((achievement) => {
			const remaining = remainingFor(achievement, visits);
			return [...sharesOf(achievement, visits)].map(([code, share]) => ({
				code,
				reason: { achievement, kind: "achievement", remaining } as const,
				weight: (TIER_WEIGHTS[achievement.tier] * share) / remaining,
			}));
		});

/** The countries that border one already visited, each with the latest-visited of its neighbours. */
const neighbourReasonsOf = (countries: readonly CountryData[], visits: Visits): Weighed[] =>
	countries.flatMap(({ iso3166, neighbours = [] }) => {
		const [latest] = neighbours
			.filter((code) => isVisited(visits, code))
			.toSorted(
				(one, other) =>
					(visits[other]?.at ?? "").localeCompare(visits[one]?.at ?? "") ||
					one.localeCompare(other),
			);
		return latest === undefined
			? []
			: [
					{
						code: iso3166,
						reason: { kind: "neighbour", neighbour: latest } as const,
						weight: NEIGHBOUR_WEIGHT,
					},
				];
	});

/** The countries in continents with no visits yet. */
const regionReasonsOf = (countries: readonly CountryData[], visits: Visits): Weighed[] => {
	const visited = new Set(
		countries.filter(({ iso3166 }) => isVisited(visits, iso3166)).map(({ region }) => region),
	);
	return countries
		.filter(({ region }) => !visited.has(region))
		.map(({ iso3166, region }) => ({
			code: iso3166,
			reason: { kind: "region", region } as const,
			weight: NEW_REGION_WEIGHT,
		}));
};

/** The middle of a country's box, as a latitude and longitude in radians, if it has one. */
const middleOf = ({ bounds }: CountryData): readonly [number, number] | undefined => {
	if (bounds === undefined) {
		return undefined;
	}
	const [west, south, east, north] = bounds;
	const longitude = (west + east) / 2;
	return [
		((south + north) / 2) * RADIANS,
		(longitude > TURN_DEGREES / 2 ? longitude - TURN_DEGREES : longitude) * RADIANS,
	];
};

/** How far apart two places on the globe are, as a share of the furthest two can be. */
const distanceBetween = (
	[oneLatitude, oneLongitude]: readonly [number, number],
	[otherLatitude, otherLongitude]: readonly [number, number],
): number =>
	Math.acos(
		Math.min(
			1,
			Math.sin(oneLatitude) * Math.sin(otherLatitude) +
				Math.cos(oneLatitude) * Math.cos(otherLatitude) * Math.cos(oneLongitude - otherLongitude),
		),
	) / Math.PI;

/** How near each country is to the nearest one already visited, from 1 on the doorstep to 0. */
const nearnessOf = (
	countries: readonly CountryData[],
	visits: Visits,
): ReadonlyMap<string, number> => {
	const visited = countries
		.filter(({ iso3166 }) => isVisited(visits, iso3166))
		.flatMap((country) => {
			const middle = middleOf(country);
			return middle === undefined ? [] : [middle];
		});
	return new Map(
		countries.map((country) => {
			const middle = middleOf(country);
			const nearest =
				middle === undefined
					? 1
					: Math.min(1, ...visited.map((place) => distanceBetween(middle, place)));
			return [country.iso3166, 1 - nearest];
		}),
	);
};

/** Every reason to visit each country not yet visited, by its code. */
const reasonsByCode = (
	countries: readonly CountryData[],
	visits: Visits,
	achievements: readonly Achievement[],
): ReadonlyMap<string, readonly Weighed[]> => {
	const byCode = new Map<string, Weighed[]>();
	for (const weighed of [
		...achievementReasonsOf(achievements, visits),
		...neighbourReasonsOf(countries, visits),
		...regionReasonsOf(countries, visits),
	]) {
		if (!isVisited(visits, weighed.code)) {
			byCode.set(weighed.code, [...(byCode.get(weighed.code) ?? []), weighed]);
		}
	}
	return byCode;
};

/**
 * The countries most worth visiting next, best first, each with why. A country counts for every
 * reason there is to go: each visa it brings nearer, most for the rarest and nearest, bordering
 * somewhere already visited, and being a continent's first; and all of it counts for more the
 * nearer the country is to somewhere already visited. Nothing is recommended to
 * a map with no visits yet, as there is nothing yet to say what its reader is after.
 */
export const recommendationsOf = (
	countries: readonly CountryData[],
	visits: Visits,
	achievements: readonly Achievement[],
): readonly Recommendation[] => {
	if (Object.keys(visits).length === 0) {
		return [];
	}
	const nearness = nearnessOf(countries, visits);
	const scored = [...reasonsByCode(countries, visits, achievements)].map(([code, reasons]) => ({
		code,
		reasons,
		score:
			reasons.reduce((total, { weight }) => total + weight, 0) *
			(FARTHEST_SHARE + (1 - FARTHEST_SHARE) * (nearness.get(code) ?? 0)),
	}));
	return scored
		.toSorted((one, other) => other.score - one.score || one.code.localeCompare(other.code))
		.slice(0, RECOMMENDATION_COUNT)
		.map(({ code, reasons }) => ({
			code,
			reasons: reasons
				.toSorted((one, other) => other.weight - one.weight)
				.map(({ reason }) => reason),
		}));
};
