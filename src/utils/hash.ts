/** Keeps a running hash well inside the integers a number holds exactly. */
const HASH_MODULUS = 1_679_609;
const HASH_MULTIPLIER = 31;

/**
 * A small, stable hash of `text`: the same text always gives the same number, and texts that differ
 * by a character almost always give different ones. It is for telling things apart and picking
 * between options deterministically, never for anything that needs to be secure.
 */
export const hashOf = (text: string): number => {
	let hash = 0;
	for (let index = 0; index < text.length; index += 1) {
		hash = (hash * HASH_MULTIPLIER + (text.codePointAt(index) ?? 0)) % HASH_MODULUS;
	}
	return hash;
};
