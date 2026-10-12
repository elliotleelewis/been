import { render } from "@testing-library/react";
import { Map as MapLibreMap } from "maplibre-gl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";

import { MapLayerKeys } from "../models/enums";
import { LABELS_LAYER_ID, assertDefined, mockMediaQueryList, stubBasemap } from "../utils/test";
import { Globe } from "./globe";

/**
 * The map the globe holds is private to it, so a spied call is the only handle a test has on it.
 */
const mapBehind = (spy: MockInstance): MapLibreMap | undefined => {
	const [map] = spy.mock.contexts;
	return map instanceof MapLibreMap ? map : undefined;
};

/**
 * `Map` loads MapLibre asynchronously and the fill waits on the style that names its anchor, so
 * the layer landing is what says both have happened.
 */
const renderGlobe = async (): Promise<MapLibreMap> => {
	const addLayer = vi.spyOn(MapLibreMap.prototype, "addLayer");
	render(<Globe />);
	await vi.waitUntil(() => mapBehind(addLayer)?.getLayer(MapLayerKeys.Been), { timeout: 15_000 });
	return assertDefined(mapBehind(addLayer), "The globe never built a map.");
};

describe("globe basemap", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
		stubBasemap();
	});

	// MapLibre drops a layer whose `beforeId` names nothing without throwing, so a fill anchored to
	// a layer the basemap does not have would go missing rather than fail. Reading the order back
	// is what tells the two apart.
	it("should draw the been layer beneath the basemap's labels", async () => {
		expect.hasAssertions();

		const map = await renderGlobe();
		const order = map.getStyle().layers.map((layer) => layer.id);

		expect(order).toContain(MapLayerKeys.Been);
		expect(order.indexOf(MapLayerKeys.Been)).toBeLessThan(order.indexOf(LABELS_LAYER_ID));
	}, 30_000);

	// MapLibre opens on a flat Mercator map unless it is asked otherwise, which the app was never
	// having to ask for while mapbox-gl was rounding the world off on its own below zoom 6.
	it("should draw the world as a globe rather than a flat map", async () => {
		expect.hasAssertions();

		const map = await renderGlobe();

		expect(map.getProjection().type).toBe("globe");
	}, 30_000);
});
