import { M49_REGIONS, M49_REGION_CODES } from "../core/m49.ts";
import type { M49Region } from "../core/m49.ts";
import type { AchievementTier, Comparison, CountryData, Visits } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { BAR_LENGTH, EMPTY_SQUARE, REGION_SQUARES } from "./types.ts";

const PERCENT = 100;

/** How far through a continent a map is: how many of its countries it has, of how many. */
interface RegionProgress {
	readonly region: M49Region;
	readonly visited: number;
	readonly total: number;
}

/**
 * A continent's bar: a square of its ink for every tenth of it visited, rounded, but at least one
 * for any visit at all, and all of them only once every country is in, then empty squares.
 */
const barOf = ({ region, total, visited }: RegionProgress): string => {
	const rounded = Math.round((visited / total) * BAR_LENGTH);
	const filled =
		visited === 0
			? 0
			: Math.min(Math.max(rounded, 1), visited < total ? BAR_LENGTH - 1 : BAR_LENGTH);
	return REGION_SQUARES[region].repeat(filled) + EMPTY_SQUARE.repeat(BAR_LENGTH - filled);
};

/** Each continent's progress, the furthest through first, then the most visited. */
const progressOf = (countries: readonly CountryData[], visits: Visits): readonly RegionProgress[] =>
	M49_REGION_CODES.map((region) => {
		const inRegion = countries.filter((country) => country.region === region);
		return {
			region,
			total: inRegion.length,
			visited: inRegion.filter(({ iso3166 }) => Object.hasOwn(visits, iso3166)).length,
		};
	})
		.filter(({ total }) => total > 0)
		.toSorted(
			(one, other) =>
				other.visited / other.total - one.visited / one.total || other.visited - one.visited,
		);

/** The line counting the visas earned, and the rare ones among them, if any are. */
const visaLineOf = (tiers: readonly AchievementTier[]): readonly string[] => {
	const count = (tier: AchievementTier): number => tiers.filter((each) => each === tier).length;
	const parts = [
		m.share_emoji_visas({ count: tiers.length }),
		...(count("foil") > 0 ? [m.share_emoji_foil({ count: count("foil") })] : []),
		...(count("legendary") > 0 ? [m.share_emoji_legendary({ count: count("legendary") })] : []),
	];
	return tiers.length === 0 ? [] : ["", parts.join(" · ")];
};

/**
 * The line saying how the map compares with the one the reader opened, from the side of whoever
 * sent it, as a reply to them reads: what the two have in common, and what is new to them.
 */
const replyLineOf = (comparison: Comparison | null): readonly string[] =>
	comparison === null
		? []
		: ["", m.share_emoji_reply({ both: comparison.both.length, mine: comparison.mine.length })];

/** What a map's summary is made from. */
export interface SummaryInput {
	/** Every country there is, which each continent's share is of. */
	readonly countries: readonly CountryData[];
	readonly visits: Visits;
	/** The tier of every achievement the map has earned, one for each of its visas. */
	readonly tiers: readonly AchievementTier[];
	/** The link to the map, which it ends with. */
	readonly url: string;
	/** The map set against the last shared map the reader opened, when it is a reply to one. */
	readonly comparison: Comparison | null;
}

/**
 * A map summed up in a few lines of text and emoji, to paste anywhere: how many countries of the
 * world, a bar for each continent in its stamps' ink, how many visas, and how it compares with the
 * map it replies to, if it does. It ends asking whoever reads it to answer with a map of their own,
 * or to see how the two compare, then the link, which shows the whole map to whoever opens it.
 */
export const summaryOf = ({ comparison, countries, tiers, url, visits }: SummaryInput): string => {
	const visited = countries.filter(({ iso3166 }) => Object.hasOwn(visits, iso3166)).length;
	return [
		m.share_emoji_headline({
			count: visited,
			percent: Math.round((visited / Math.max(countries.length, 1)) * PERCENT),
			total: countries.length,
		}),
		"",
		...progressOf(countries, visits).map(
			(progress) =>
				`${barOf(progress)} ${M49_REGIONS[progress.region]()} ${String(progress.visited)}/${String(progress.total)}`,
		),
		...visaLineOf(tiers),
		...replyLineOf(comparison),
		"",
		comparison === null ? m.share_emoji_invite() : m.share_emoji_reply_invite(),
		url,
	].join("\n");
};
