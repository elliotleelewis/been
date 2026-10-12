import { M49_REGIONS } from "../models/m49";
import type { M49Region } from "../models/m49";

export const isM49Region = (value: unknown): value is M49Region =>
	typeof value === "string" && Object.hasOwn(M49_REGIONS, value);

// Sorted, because `Object.keys` lists the codes that read as whole numbers, such as 142, ahead of
// the zero-padded ones, such as 002.
export const M49_REGION_CODES: readonly M49Region[] = Object.keys(M49_REGIONS)
	.filter((code) => isM49Region(code))
	.toSorted();

// Whether a value read back from storage is the list of continents the menu has open, or the
// `null` that stands for "the reader has not chosen yet".
export const isExpandedRegions = (value: unknown): value is readonly M49Region[] | null =>
	value === null || (Array.isArray(value) && value.every((code) => isM49Region(code)));

// The first part of an IANA time zone name, mapped to the M49 region it mostly sits in. Zones
// named after an ocean, such as `Atlantic/Reykjavik` or `Indian/Mauritius`, span more than one
// region, so they are left out rather than guessed at.
const TIME_ZONE_REGIONS: Readonly<Record<string, M49Region>> = {
	Africa: "002",
	America: "019",
	Asia: "142",
	Australia: "009",
	Europe: "150",
	Pacific: "009",
};

// A best guess at the reader's home region from their time zone, which says where they are without
// asking. It only decides which continent the menu opens first, so a wrong guess costs little.
export const homeRegionOf = (timeZone: string): M49Region | undefined => {
	const [area] = timeZone.split("/");
	return area === undefined ? undefined : TIME_ZONE_REGIONS[area];
};
