import type { Comparison, Standing, Visits } from "./types.ts";

/**
 * Sets a shared map's visits against the reader's own, sorting `codes`, in their order, into those
 * on both maps, those on the shared one only and those on the reader's only. Codes on neither are
 * left out.
 */
export const compareVisits = (
	theirs: Visits,
	mine: Visits,
	codes: readonly string[],
): Comparison => {
	const isTheirs = (code: string): boolean => Object.hasOwn(theirs, code);
	const isMine = (code: string): boolean => Object.hasOwn(mine, code);
	return {
		both: codes.filter((code) => isTheirs(code) && isMine(code)),
		mine: codes.filter((code) => isMine(code) && !isTheirs(code)),
		theirs: codes.filter((code) => isTheirs(code) && !isMine(code)),
	};
};

/** Every standing a country can have in a comparison. */
const STANDINGS: readonly Standing[] = ["both", "theirs", "mine"];

/** Each country's standing in a comparison, by its code. */
export const standingsOf = (comparison: Comparison): ReadonlyMap<string, Standing> =>
	new Map(
		STANDINGS.flatMap((standing) =>
			comparison[standing].map((code): [string, Standing] => [code, standing]),
		),
	);
