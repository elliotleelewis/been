import { useEffect, useState } from "react";

import { loadAtlas } from "../data/atlas";
import { EMPTY_BOUNDARIES, toBoundaries } from "../data/boundaries";
import type { CountryBoundaries } from "../data/boundaries";

// Fetches the country boundaries once, giving the map an empty collection to draw until they land.
export const useCountryBoundaries = (): CountryBoundaries => {
	const [boundaries, setBoundaries] = useState<CountryBoundaries>(EMPTY_BOUNDARIES);

	useEffect((): (() => void) => {
		const controller = new globalThis.AbortController();
		loadAtlas(controller.signal)
			.then((topology): void => {
				setBoundaries(toBoundaries(topology));
			})
			.catch((cause: unknown): void => {
				// An aborted fetch is this effect being cleaned up, not a failure worth reporting.
				if (!controller.signal.aborted) {
					console.error("Failed to load country boundaries.", cause);
				}
			});
		return (): void => {
			controller.abort();
		};
	}, []);

	return boundaries;
};
