import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

import { countriesAtom } from "../core/countries.ts";
import { tapCountryAtom } from "./taps.ts";

/** The country under a mouse, and where over the map the mouse is, in pixels from its corner. */
export interface CountryHover {
	readonly code: string;
	readonly left: number;
	readonly name: string;
	readonly top: number;
}

export interface CountryPointer {
	readonly hover: CountryHover | null;
	readonly onClick: (event: MapLayerMouseEvent) => void;
	readonly onMouseMove: (event: MapLayerMouseEvent) => void;
	readonly onMouseOut: () => void;
}

/** How far, in pixels, a point can come back from the round trip and still be on the globe. */
const ON_GLOBE_PX = 2;

/**
 * Whether a pointer event landed on the globe itself rather than the space around it. Off the
 * globe, the map pins the point to the nearest place on its horizon, and finds whatever country
 * lies there on the far side, so a country could be picked from an inch away. A point on the globe
 * comes back to itself from the place under it; a pinned one comes back to the horizon.
 */
const isOnGlobe = ({ lngLat, point, target }: MapLayerMouseEvent): boolean => {
	const back = target.project(lngLat);
	return Math.hypot(back.x - point.x, back.y - point.y) <= ON_GLOBE_PX;
};

/**
 * The country a pointer event landed on, from the features the map found under it on the layers
 * it was told are interactive, so long as it landed on the globe at all.
 */
const countryCodeOf = (event: MapLayerMouseEvent): string | undefined => {
	const code: unknown = event.features?.[0]?.properties["iso_3166_1"];
	return typeof code === "string" && isOnGlobe(event) ? code : undefined;
};

/**
 * What the pointer does over the globe: a click or a tap ticks the country under it, and a mouse
 * is followed so the country under it can be named. Touch has no hover, so on a phone the toast a
 * tap raises is what says which country was under the reader's finger.
 */
export const useCountryPointer = (): CountryPointer => {
	const countries = useAtomValue(countriesAtom);
	const tapCountry = useSetAtom(tapCountryAtom);
	const [hovered, setHovered] = useState<Omit<CountryHover, "name"> | null>(null);

	const onClick = useCallback(
		(event: MapLayerMouseEvent) => {
			const code = countryCodeOf(event);
			if (code !== undefined) {
				tapCountry(code);
			}
		},
		[tapCountry],
	);
	const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
		const code = countryCodeOf(event);
		setHovered(code === undefined ? null : { code, left: event.point.x, top: event.point.y });
	}, []);
	const onMouseOut = useCallback(() => {
		setHovered(null);
	}, []);

	const name = countries.find(({ iso3166 }) => iso3166 === hovered?.code)?.name;
	const hover = useMemo(
		() => (hovered === null || name === undefined ? null : { ...hovered, name }),
		[hovered, name],
	);

	return useMemo(
		() => ({ hover, onClick, onMouseMove, onMouseOut }),
		[hover, onClick, onMouseMove, onMouseOut],
	);
};
