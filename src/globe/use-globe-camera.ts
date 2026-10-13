import type { RefObject } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";

import { useFocusCamera } from "./use-focus-camera.ts";
import { useIdleSpin } from "./use-idle-spin.ts";

/**
 * Everything the camera does on its own: framing the countries the reader ticks, and turning the
 * globe slowly once it has been left alone. Returns the `onMoveStart` handler that lets the
 * reader's own gestures take the camera back.
 */
export const useGlobeCamera = (
	mapRef: RefObject<MapRef | null>,
): ((event: ViewStateChangeEvent) => void) => {
	useIdleSpin(mapRef);
	return useFocusCamera(mapRef);
};
