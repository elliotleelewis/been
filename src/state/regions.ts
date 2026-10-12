import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { M49Region } from "../models/m49.ts";
import { M49_REGION_CODES, homeRegionOf, isExpandedRegions } from "../utils/m49.ts";
import { validatedStorage } from "./storage.ts";

const EXPANDED_REGIONS_STORAGE_KEY = "APP_EXPANDED_REGIONS";

/** The continent the reader is most likely to be in, which the menu lists first and opens. */
export const homeRegionAtom = atom<M49Region | undefined>(
	homeRegionOf(new Intl.DateTimeFormat().resolvedOptions().timeZone),
);

/**
 * The continents the reader has left open in the menu, or `null` until they first open or close
 * one. Until then only their home continent is open, or every continent when there is no guess at
 * where home is, so that nothing starts out hidden.
 */
const storedExpandedRegionsAtom = atomWithStorage<readonly M49Region[] | null>(
	EXPANDED_REGIONS_STORAGE_KEY,
	null,
	validatedStorage(isExpandedRegions),
	{ getOnInit: true },
);
export const expandedRegionsAtom = atom<readonly M49Region[]>((get) => {
	const homeRegion = get(homeRegionAtom);
	return (
		get(storedExpandedRegionsAtom) ?? (homeRegion === undefined ? M49_REGION_CODES : [homeRegion])
	);
});
export const toggleRegionAtom = atom(undefined, (get, set, code: M49Region) => {
	const expanded = get(expandedRegionsAtom);
	set(
		storedExpandedRegionsAtom,
		expanded.includes(code) ? expanded.filter((other) => other !== code) : [...expanded, code],
	);
});
