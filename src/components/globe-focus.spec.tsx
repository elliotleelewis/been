import { act, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { Map as MapboxMap } from "mapbox-gl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import type { Country } from "../models/country";
import { addCountryAtom, rawCountriesAtom, removeCountryAtom } from "../state/atoms";
import { mockMediaQueryList } from "../utils/test";
import { Globe } from "./globe";

// The `minZoom` the globe gives the map, which is also the zoom it opens at.
const MIN_ZOOM = 1.8;

const unitedKingdom: Country = {
	bounds: [-8.65, 49.87, 1.76, 60.86],
	iso3166: "GB",
	name: "United Kingdom",
	region: "Europe",
};

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, { [unitedKingdom.iso3166]: unitedKingdom });
	return store;
};

// `Map` loads mapbox asynchronously, so nothing camera related exists on the first render.
const renderGlobe = async (store: ReturnType<typeof createStore>): Promise<void> => {
	const { container } = render(
		<Provider store={store}>
			<Globe />
		</Provider>,
	);
	await vi.waitUntil(() => container.querySelector(".mapboxgl-canvas-container"), {
		timeout: 5000,
	});
};

// The map the globe holds is private to it, so a spied call is the only handle a test has on it.
const mapBehind = (spy: MockInstance, message: string): MapboxMap => {
	const [map] = spy.mock.contexts;
	if (!(map instanceof MapboxMap)) {
		throw new Error(message);
	}
	return map;
};

// Announces the move a user gesture would make. Mapbox tells its own camera calls apart from
// gestures by giving only the latter an `originalEvent`, which is the signal the globe reads.
const dragMap = (map: MapboxMap): void => {
	map.fire("movestart", { originalEvent: new globalThis.MouseEvent("mousemove", { buttons: 1 }) });
};

describe("globe focus", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	afterEach(() => {
		// `selectedCountriesAtom` is backed by local storage, which outlives an individual store.
		globalThis.localStorage.clear();
	});

	it("should return to the previous camera when the focused country is unselected", async () => {
		expect.hasAssertions();

		const store = createTestStore();
		const fitBounds = vi.spyOn(MapboxMap.prototype, "fitBounds");
		const easeTo = vi.spyOn(MapboxMap.prototype, "easeTo");
		await renderGlobe(store);

		act(() => {
			store.set(addCountryAtom, unitedKingdom.iso3166);
		});
		expect(fitBounds).toHaveBeenCalledWith(unitedKingdom.bounds);

		act(() => {
			store.set(removeCountryAtom, unitedKingdom.iso3166);
		});
		// The globe opens over the null island at its minimum zoom, so that is where an undo lands.
		expect(easeTo).toHaveBeenCalledWith({
			bearing: 0,
			center: { lat: 0, lng: 0 },
			pitch: 0,
			zoom: MIN_ZOOM,
		});
	}, 10_000);

	it("should keep the camera the user chose when they have moved the map themselves", async () => {
		expect.hasAssertions();

		const store = createTestStore();
		const fitBounds = vi.spyOn(MapboxMap.prototype, "fitBounds");
		const easeTo = vi.spyOn(MapboxMap.prototype, "easeTo");
		await renderGlobe(store);

		act(() => {
			store.set(addCountryAtom, unitedKingdom.iso3166);
		});
		dragMap(mapBehind(fitBounds, "The globe never asked the map to frame the country."));
		act(() => {
			store.set(removeCountryAtom, unitedKingdom.iso3166);
		});

		expect(easeTo).not.toHaveBeenCalled();
	}, 10_000);
});
