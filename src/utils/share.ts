import type { Visits } from "../models/country";
import { SHARE_CODES, SHARE_PARAM, SHARE_VERSION } from "../models/share";

const BITS_PER_BYTE = 8;
const BYTE_LENGTH = Math.ceil(SHARE_CODES.length / BITS_PER_BYTE);

/** The value of a byte's bit at `offset`, counting from its most significant end. */
const bitAt = (offset: number): number => 2 ** (BITS_PER_BYTE - 1 - offset);

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
 * Writes the countries a reader has been to as a share link's value: the format's version, a full
 * stop, then one bit per country in `SHARE_CODES`, as URL-safe base64. Every map, however full,
 * comes to the same 36 characters.
 */
export const encodeShare = (visits: Visits): string => {
	const bytes = new Uint8Array(BYTE_LENGTH);
	for (const [index, code] of SHARE_CODES.entries()) {
		const byte = Math.floor(index / BITS_PER_BYTE);
		if (Object.hasOwn(visits, code)) {
			bytes[byte] = (bytes[byte] ?? 0) + bitAt(index % BITS_PER_BYTE);
		}
	}
	return `${SHARE_VERSION}.${toBase64Url(bytes)}`;
};

/**
 * Reads a share link's value back into the visits it marks, or `undefined` when it is in no format
 * this version of the app can read.
 */
export const decodeShare = (value: string): Visits | undefined => {
	const [version, payload] = value.split(".");
	const bytes =
		version === SHARE_VERSION && payload !== undefined ? fromBase64Url(payload) : undefined;
	if (bytes?.length !== BYTE_LENGTH) {
		return undefined;
	}
	return Object.fromEntries(
		SHARE_CODES.filter((_code, index) => {
			const byte = bytes[Math.floor(index / BITS_PER_BYTE)] ?? 0;
			const bit = bitAt(index % BITS_PER_BYTE);
			return Math.floor(byte / bit) % 2 === 1;
		}).map((code) => [code, {}]),
	);
};

/** The share link value a location's hash carries, if it carries one. */
export const shareValueOf = (hash: string): string | undefined =>
	new globalThis.URLSearchParams(hash.replace(/^#/u, "")).get(SHARE_PARAM) ?? undefined;

/** A link to this page that opens with `visits` shown, read-only, in place of the reader's own. */
export const shareUrlOf = (visits: Visits, location: Pick<Location, "href">): string => {
	const url = new globalThis.URL(location.href);
	url.search = "";
	url.hash = `${SHARE_PARAM}=${encodeShare(visits)}`;
	return url.toString();
};
