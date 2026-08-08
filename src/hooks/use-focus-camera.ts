import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { CameraOptions } from "mapbox-gl";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import type { Focus } from "../models/focus";

// Frames the focused country, and returns the `onMoveStart` handler that lets the user's own
// gestures take the camera back off us.
export const useFocusCamera = (
	mapRef: RefObject<MapRef | null>,
	focus: Focus | null,
): ((event: ViewStateChangeEvent) => void) => {
	// Where the camera sat before the current focus moved it, so an unselect can undo that
	// move. Held in a ref because it is a detail of this map instance, and reading it should
	// never trigger a render.
	const cameraBeforeFocus = useRef<CameraOptions | null>(null);

	const undoFocus = useCallback((map: MapRef) => {
		const camera = cameraBeforeFocus.current;
		// An undo is only good once, and only if we still have somewhere to go back to.
		cameraBeforeFocus.current = null;
		if (camera) {
			map.easeTo(camera);
		}
	}, []);

	useEffect(() => {
		const { current: map } = mapRef;
		if (!map || !focus) {
			return;
		}
		if (focus.type === "undo") {
			undoFocus(map);
			return;
		}
		const { bounds } = focus.country;
		if (bounds) {
			cameraBeforeFocus.current = {
				bearing: map.getBearing(),
				center: map.getCenter(),
				pitch: map.getPitch(),
				zoom: map.getZoom(),
			};
			// Copied because mapbox takes a mutable tuple, and the country's bounds are shared.
			map.fitBounds([...bounds]);
		}
	}, [focus, mapRef, undoFocus]);

	return useCallback((event: ViewStateChangeEvent) => {
		// Only moves the user made themselves carry an `originalEvent`; the ones we make with
		// `fitBounds`/`easeTo` do not. Once they have moved the map, they have a view they
		// chose, and yanking it back to a camera they never asked for would be the surprise.
		if ("originalEvent" in event && event.originalEvent !== undefined) {
			cameraBeforeFocus.current = null;
		}
	}, []);
};
