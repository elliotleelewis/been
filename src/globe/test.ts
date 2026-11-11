import { getDefaultStore } from "jotai";
import { vi } from "vitest";

import { maplibreStylesLoadedAtom } from "./stylesheet.ts";

/**
 * Waits for MapLibre's stylesheet to load into a store. The globe draws nothing until it has, so a
 * test that renders it straight away, as a page that already has the styles does, loads them first.
 */
export const loadMaplibreStyles = async (store = getDefaultStore()): Promise<void> => {
	store.sub(maplibreStylesLoadedAtom, vi.fn<() => void>());
	await vi.waitUntil(() => store.get(maplibreStylesLoadedAtom));
};
