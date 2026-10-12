import type { Visits } from "../models/country";
import { SHARE_PARAM, SHARE_VERSION } from "../models/share";

const BITS_PER_BYTE = 8;

/** How many bytes it takes to hold a bit for each of `codes`. */
const byteLengthOf = (codes: readonly string[]): number => Math.ceil(codes.length / BITS_PER_BYTE);

/** The value of a byte's bit at `offset`, counting from its most significant end. */
const bitAt = (offset: number): number => 2 ** (BITS_PER_BYTE - 1 - offset);

/** Keeps the fingerprint's running hash well inside the integers a number holds exactly. */
const FINGERPRINT_MODULUS = 1_679_609;
const FINGERPRINT_RADIX = 36;
const FINGERPRINT_MULTIPLIER = 31;

/**
 * A short fingerprint of the list of codes a link marks countries against. A link marks a country
 * by its place in that list, so one written against any other list, after a country is added or
 * removed, would otherwise read as a map of the wrong countries; with this, it reads as no map.
 */
export const fingerprintOf = (codes: readonly string[]): string => {
	const text = codes.join(",");
	let hash = 0;
	for (let index = 0; index < text.length; index += 1) {
		hash = (hash * FINGERPRINT_MULTIPLIER + (text.codePointAt(index) ?? 0)) % FINGERPRINT_MODULUS;
	}
	return hash.toString(FINGERPRINT_RADIX);
};

/** Bytes as URL-safe base64, without padding, so they can sit in a link as they are. */
const toBase64Url = (bytes: Uint8Array): string =>
	globalThis
		.btoa(String.fromCodePoint(...bytes))
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/[=]+$/u, "");

/** The bytes URL-safe base64 stands for, or `undefined` when it is not base64 at all. */
const fromBase64Url = (text: string): Uint8Array | undefined => {
	try {
		const binary = globalThis.atob(text.replaceAll("-", "+").replaceAll("_", "/"));
		return Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0);
	} catch {
		return undefined;
	}
};

/**
 * Writes the countries a reader has been to as a share link's value, in three parts separated by
 * full stops: the format's version, the fingerprint of `codes`, then one bit for each of `codes`,
 * in order, as URL-safe base64. For the 195 countries the app lists, every map, however full, comes
 * to the same 40 or so characters.
 */
export const encodeShare = (visits: Visits, codes: readonly string[]): string => {
	const bytes = new Uint8Array(byteLengthOf(codes));
	for (const [index, code] of codes.entries()) {
		const byte = Math.floor(index / BITS_PER_BYTE);
		if (Object.hasOwn(visits, code)) {
			bytes[byte] = (bytes[byte] ?? 0) + bitAt(index % BITS_PER_BYTE);
		}
	}
	return [SHARE_VERSION, fingerprintOf(codes), toBase64Url(bytes)].join(".");
};

/**
 * Reads a share link's value back into the visits it marks against `codes`, or `undefined` when it
 * is in no format this version of the app can read, or was written against another list of codes.
 */
export const decodeShare = (value: string, codes: readonly string[]): Visits | undefined => {
	const [version, fingerprint, payload] = value.split(".");
	const readable = version === SHARE_VERSION && fingerprint === fingerprintOf(codes);
	const bytes = readable && payload !== undefined ? fromBase64Url(payload) : undefined;
	if (bytes?.length !== byteLengthOf(codes)) {
		return undefined;
	}
	return Object.fromEntries(
		codes
			.filter((_code, index) => {
				const byte = bytes[Math.floor(index / BITS_PER_BYTE)] ?? 0;
				return Math.floor(byte / bitAt(index % BITS_PER_BYTE)) % 2 === 1;
			})
			.map((code) => [code, {}]),
	);
};

/** The share link value a location's hash carries, if it carries one. */
export const shareValueOf = (hash: string): string | undefined =>
	new globalThis.URLSearchParams(hash.replace(/^#/u, "")).get(SHARE_PARAM) ?? undefined;

/** A link to this page that opens `value`'s map, read-only, in place of the reader's own. */
export const shareUrlOf = (value: string, location: Pick<Location, "href">): string => {
	const url = new globalThis.URL(location.href);
	url.search = "";
	url.hash = `${SHARE_PARAM}=${value}`;
	return url.toString();
};
