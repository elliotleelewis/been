import type { Achievement, Earners, Visits } from "./types.ts";

/**
 * The visited ones of `codes` in the order they were ticked: those ticked before dates were kept
 * first, as `earnedOn` counts them, and ticks on the same day by code, so the order is stable.
 */
const inTickOrder = (codes: readonly string[], visits: Visits): readonly string[] =>
	codes
		.filter((code) => Object.hasOwn(visits, code))
		.toSorted(
			(one, other) =>
				(visits[one]?.at ?? "").localeCompare(visits[other]?.at ?? "") || one.localeCompare(other),
		);

/**
 * Which visited countries earned an achievement: for each requirement, the first ticks that met it
 * and the rest that also count, and the one tick that met the last requirement. The countries that
 * earned it are the ones `earnedOn` dates it by, so the back of a visa agrees with its front.
 */
export const earnersOf = (achievement: Achievement, visits: Visits): Earners => {
	const parts = achievement.requirements.map(({ codes, count }) => {
		const ticked = inTickOrder(codes, visits);
		return { count, earned: ticked.slice(0, count), extra: ticked.slice(count) };
	});
	const clincher = parts.every(({ count, earned }) => earned.length === count)
		? inTickOrder(
				parts.flatMap(({ earned }) => earned.slice(-1)),
				visits,
			).at(-1)
		: undefined;
	return {
		clincher: clincher === undefined || visits[clincher]?.at === undefined ? undefined : clincher,
		requirements: parts.map(({ earned, extra }) => ({ earned, extra })),
	};
};
