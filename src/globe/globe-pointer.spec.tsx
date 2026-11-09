import { act, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import type { LngLatLike } from "maplibre-gl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { focusAtom, visitsAtom } from "../core/selection.ts";
import {
	TODAY,
	assertDefined,
	freezeToday,
	mockMediaQueryList,
	stubBasemap,
} from "../core/test.ts";
import type { Country } from "../core/types.ts";
import { Globe } from "./globe.tsx";
import { MapLayerKeys } from "./types.ts";

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

/** Points at a pixel of the map as a mouse would, so the map works out what is under it itself. */
const pointAtPixel = (
	map: MapLibreMap,
	type: "click" | "mousemove",
	[across, down]: readonly [number, number],
): void => {
	const { left, top } = map.getCanvasContainer().getBoundingClientRect();
	const event = new globalThis.MouseEvent(type, {
		clientX: left + across,
		clientY: top + down,
	});
	act(() => {
		map.fire(new MapMouseEvent(type, map, event));
	});
};

/** Points at a place on the map as a mouse would. */
const pointAt = (map: MapLibreMap, type: "click" | "mousemove", place: LngLatLike): void => {
	const { x: across, y: down } = map.project(place);
	pointAtPixel(map, type, [across, down]);
};

/**
 * Turns the globe so England sits on its upper edge, and finds a pixel in the space above it,
 * which the map pins to its horizon, and so to whatever country lies there on the far side.
 */
const spaceBeyondTheEdge = (
	map: MapLibreMap,
): { readonly code: string; readonly space: readonly [number, number] } => {
	act(() => {
		map.jumpTo({ center: [-1.5, -36] });
	});
	const { x: across, y: down } = map.project(ENGLAND);
	const space = [across, down - 40] as const;
	const [pinned] = map.queryRenderedFeatures([...space], { layers: [MapLayerKeys.Hit] });
	const code: unknown = pinned?.properties["iso_3166_1"];
	return {
		code: assertDefined(typeof code === "string" ? code : undefined, "Space finds no country."),
		space,
	};
};

describe("globe pointer", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
		stubBasemap();
	});

	afterEach(() => {
		vi.useRealTimers();
		globalThis.localStorage.clear();
	});

	it("should tick a country when it is clicked, and leave the camera where it is", async () => {
		expect.hasAssertions();
		freezeToday();

		const store = createStore();
		const { map } = await renderGlobe(store);

		pointAt(map, "click", ENGLAND);

		expect(store.get(visitsAtom)).toStrictEqual({ GB: { at: TODAY } });
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

	it("should neither name nor tick a country beyond the edge of the globe", async () => {
		expect.hasAssertions();

		const store = createStore();
		const { container, map } = await renderGlobe(store);
		const { code, space } = spaceBeyondTheEdge(map);
		act(() => {
			store.set(rawCountriesAtom, { [code]: { iso3166: code, region: "002", subregion: "015" } });
		});
		const text = container.textContent;

		pointAtPixel(map, "mousemove", space);
		pointAtPixel(map, "click", space);

		expect(container.textContent).toBe(text);
		expect(store.get(visitsAtom)).toStrictEqual({});
	}, 30_000);
});
