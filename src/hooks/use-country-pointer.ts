import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

import { countriesAtom } from "../state/atoms.ts";
import { tapCountryAtom } from "../state/taps.ts";

// The country under a mouse, and where over the map the mouse is, in pixels from its corner.
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

// The country a pointer event landed on, from the features the map found under it on the layers
// it was told are interactive.
const countryCodeOf = (event: MapLayerMouseEvent): string | undefined => {
	const code: unknown = event.features?.[0]?.properties["iso_3166_1"];
	return typeof code === "string" ? code : undefined;
};

// What the pointer does over the globe: a click or a tap ticks the country under it, and a mouse
// is followed so the country under it can be named. Touch has no hover, so on a phone the toast a
// tap raises is what says which country was under the reader's finger.
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
