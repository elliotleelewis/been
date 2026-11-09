import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";

import { MAX_SPIN_ZOOM, spunCameraOf } from "./spin.ts";

/** How long the globe has to be left alone before it starts to turn, in milliseconds. */
const IDLE_MS = 8000;
/** The map events that mean someone is using the globe, which stop it turning. */
const ACTIVITY_EVENTS = ["mousedown", "touchstart", "wheel", "dragstart"] as const;

/** Whether the globe should turn this frame: left alone long enough, and zoomed out. */
const canSpin = (map: MapLibreMap, idleFor: number): boolean =>
	idleFor > IDLE_MS && map.getZoom() <= MAX_SPIN_ZOOM;

/** Turns the globe `elapsed` milliseconds further, bringing the camera back towards home with it. */
const spin = (map: MapLibreMap, elapsed: number): void => {
	const { lat, lng } = map.getCenter();
	map.jumpTo(spunCameraOf([lng, lat], map.getZoom(), elapsed));
};

/**
 * Turns the globe slowly from west to east, as the Earth does, once it has been left alone for a
 * while with the whole world in view, and brings the camera back to where it opens as it turns.
 * Anyone touching, scrolling or dragging it stops it at once, and so does the camera moving any
 * other way, such as to frame a country ticked in the list or a stamp tapped in the passport; it
 * waits to be left alone again before carrying on. A reader who has asked for less motion never
 * sees it turn, and a hidden tab does not turn it, as animation frames stop there.
 */
export const useIdleSpin = (mapRef: RefObject<MapRef | null>): void => {
	useEffect(() => {
		let frame = 0;
		let lastActive = globalThis.performance.now();
		let lastFrame = lastActive;
		let watched: MapLibreMap | null = null;
		const wake = (): void => {
			lastActive = globalThis.performance.now();
		};
		const watch = (map: MapLibreMap): void => {
			for (const event of ACTIVITY_EVENTS) {
				map.on(event, wake);
			}
			watched = map;
		};
		const tick = (now: number): void => {
			const map = mapRef.current?.getMap();
			if (map !== undefined && map !== watched) {
				watch(map);
			}
			// The camera moving on its own, to frame a country, counts as the globe being used, so it
			// is left to be looked at for as long as after a touch.
			if (map?.isMoving() === true) {
				lastActive = now;
			} else if (map !== undefined && canSpin(map, now - lastActive)) {
				spin(map, now - lastFrame);
			}
			lastFrame = now;
			frame = globalThis.requestAnimationFrame(tick);
		};
		if (!globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			frame = globalThis.requestAnimationFrame(tick);
		}
		return (): void => {
			globalThis.cancelAnimationFrame(frame);
			for (const event of ACTIVITY_EVENTS) {
				watched?.off(event, wake);
			}
		};
	}, [mapRef]);
};
