import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";

/** How long the globe has to be left alone before it starts to turn, in milliseconds. */
const IDLE_MS = 8000;
/** How fast it turns: a whole turn every two minutes, in degrees of longitude a millisecond. */
const DEGREES_PER_MS = 360 / 120_000;
/** The closest the camera can be for the globe to turn, so a country being looked at stays put. */
const MAX_SPIN_ZOOM = 2.6;
/** The map events that mean someone is using the globe, which stop it turning. */
const ACTIVITY_EVENTS = ["mousedown", "touchstart", "wheel", "dragstart"] as const;

/** Whether the globe should turn this frame: left alone long enough, still, and zoomed out. */
const canSpin = (map: MapLibreMap, idleFor: number): boolean =>
	idleFor > IDLE_MS && !map.isMoving() && map.getZoom() <= MAX_SPIN_ZOOM;

/**
 * Turns the globe slowly from west to east, as the Earth does, once it has been left alone for a
 * while with the whole world in view. Anyone touching, scrolling or dragging it stops it at once,
 * and it waits to be left alone again before carrying on. A reader who has asked for less motion
 * never sees it turn, and a hidden tab does not turn it, as animation frames stop there.
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
		const tick = (now: number): void => {
			const map = mapRef.current?.getMap();
			if (map !== undefined && map !== watched) {
				for (const event of ACTIVITY_EVENTS) {
					map.on(event, wake);
				}
				watched = map;
			}
			if (map !== undefined && canSpin(map, now - lastActive)) {
				const { lat, lng } = map.getCenter();
				map.setCenter([lng - DEGREES_PER_MS * (now - lastFrame), lat]);
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
