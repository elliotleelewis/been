import { act, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import type { LngLatLike } from "maplibre-gl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import type { Country } from "../models/country";
import { MapLayerKeys } from "../models/enums";
import { focusAtom, rawCountriesAtom, visitsAtom } from "../state/atoms";
import { assertDefined, mockMediaQueryList, stubBasemap } from "../utils/test";
import { Globe } from "./globe";

const unitedKingdom: Country = {
	iso3166: "GB",
	name: "United Kingdom",
	region: "150",
	subregion: "154",
};

/**
 * Inland England, and open ocean in the South Atlantic, both on the side of the globe it opens on.
 */
const ENGLAND: LngLatLike = [-1.5, 52.5];
const OCEAN: LngLatLike = [-15, -30];

/**
 * The map the globe holds is private to it, so a spied call is the only handle a test has on it.
 */
const mapBehind = (spy: MockInstance): MapLibreMap | undefined => {
	const [map] = spy.mock.contexts;
	return map instanceof MapLibreMap ? map : undefined;
};

/** Waits for the atlas to be drawn far enough that the map can find England under a pointer. */
const renderGlobe = async (
	store: ReturnType<typeof createStore>,
): Promise<{ readonly container: HTMLElement; readonly map: MapLibreMap }> => {
	const addLayer = vi.spyOn(MapLibreMap.prototype, "addLayer");
	const { container } = render(
		<Provider store={store}>
			<Globe />
		</Provider>,
	);
	await vi.waitUntil(
		() => {
			const map = mapBehind(addLayer);
			return (
				map?.getLayer(MapLayerKeys.Hit) !== undefined &&
				map.queryRenderedFeatures(map.project(ENGLAND), { layers: [MapLayerKeys.Hit] }).length > 0
			);
		},
		{ interval: 100, timeout: 20_000 },
	);
	return { container, map: assertDefined(mapBehind(addLayer), "The globe never built a map.") };
};

/** Points at a place on the map as a mouse would, so the map works out what is under it itself. */
const pointAt = (map: MapLibreMap, type: "click" | "mousemove", place: LngLatLike): void => {
	const point = map.project(place);
	const { left, top } = map.getCanvasContainer().getBoundingClientRect();
	const event = new globalThis.MouseEvent(type, {
		clientX: left + point.x,
		clientY: top + point.y,
	});
	act(() => {
		map.fire(new MapMouseEvent(type, map, event));
	});
};

describe("globe pointer", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
		stubBasemap();
	});

	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should tick a country when it is clicked, and leave the camera where it is", async () => {
		expect.hasAssertions();

		const store = createStore();
		const { map } = await renderGlobe(store);

		pointAt(map, "click", ENGLAND);

		expect(store.get(visitsAtom)).toStrictEqual({ GB: {} });
		expect(store.get(focusAtom)).toBeNull();
	}, 30_000);

	it("should name the country under the mouse, and nothing over the sea", async () => {
		expect.hasAssertions();

		const store = createStore();
		store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom });
		const { container, map } = await renderGlobe(store);

		pointAt(map, "mousemove", ENGLAND);
		expect(container).toHaveTextContent("United Kingdom");

		pointAt(map, "mousemove", OCEAN);
		expect(container).not.toHaveTextContent("United Kingdom");
	}, 30_000);
});
