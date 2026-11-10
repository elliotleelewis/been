import { useAtomValue } from "jotai";
import type {
	ExpressionSpecification,
	FillLayerSpecification,
	LineLayerSpecification,
} from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";

import { comparisonAtom } from "../core/comparison.ts";
import { recommendedCodesAtom } from "../core/recommended.ts";
import { pointedCountryAtom, selectedCountriesAtom } from "../core/selection.ts";
import { stampMomentAtom } from "../core/ticking.ts";

type Filter = NonNullable<FillLayerSpecification["filter"]>;
type Paint = NonNullable<FillLayerSpecification["paint"]>;
type LinePaint = NonNullable<LineLayerSpecification["paint"]>;

export interface GlobeLayers {
	beenFilter: Filter;
	beenPaint: Paint;
	freshFilter: Filter;
	freshPaint: Paint;
	hoverFilter: Filter;
	hoverPaint: Paint;
	hitPaint: Paint;
	/** The countries on the reader's own map alone, outlined, while a shared map is set against it. */
	mineFilter: Filter;
	minePaint: LinePaint;
	/** The countries recommended to visit next, outlined. */
	nextFilter: Filter;
	nextPaint: LinePaint;
}

const PRIMARY = "#fd7e14";
/** A shared map's countries new to the reader, as `--color-theirs` in `src/styles.css` has it. */
const THEIRS = "#0ea5e9";
const BEEN_OPACITY = 0.6;
/** How long a newly ticked country takes to fill in, in milliseconds. */
const FRESH_FADE_MS = 700;
/**
 * How long the fresh layer is left at nothing before it is asked to fade in. MapLibre only
 * transitions a paint property from the value it last drew, so the layer has to have been drawn
 * empty first.
 */
const FRESH_FADE_DELAY_MS = 40;

/**
 * Every country, drawn invisibly, so that the pointer has something to land on over a country the
 * reader has not been to. MapLibre still finds features under the pointer on a layer it draws
 * with no opacity.
 */
const HIT_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": 0 };
const BEEN_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": BEEN_OPACITY };
const HOVER_PAINT: Paint = { "fill-color": PRIMARY, "fill-opacity": 0.25 };
/** A dashed outline, as a route not yet taken, faint enough to leave the ticked fills to lead. */
const NEXT_PAINT: LinePaint = {
	"line-color": PRIMARY,
	"line-dasharray": [2, 1.5],
	"line-opacity": 0.85,
	"line-width": 1.5,
};

/** A solid outline, for countries on the reader's own map that a shared map set against it lacks. */
const MINE_PAINT: LinePaint = {
	"line-color": PRIMARY,
	"line-opacity": 0.9,
	"line-width": 2,
};

/** An expression for whether a country is one of `codes`. */
const isAmong = (codes: readonly string[]): ExpressionSpecification => [
	"in",
	["get", "iso_3166_1"],
	["literal", codes],
];

/** A filter matching the countries in `codes`. */
const isAnyOf = (codes: readonly string[]): Filter => isAmong(codes);

/** A filter matching the country `code`, or none at all when there is no code. */
const isCountry = (code: string | undefined): Filter => ["==", ["get", "iso_3166_1"], code ?? ""];

/**
 * The country whose fill is fading in, once the fresh layer has been drawn empty for it: a country
 * just stamped, until its stamp moment is over.
 */
const useFadingIn = (fresh: string | undefined): string | undefined => {
	const [fading, setFading] = useState<string>();
	useEffect(() => {
		const timeout = globalThis.setTimeout(() => {
			setFading(fresh);
		}, FRESH_FADE_DELAY_MS);
		return (): void => {
			globalThis.clearTimeout(timeout);
		};
	}, [fresh]);
	return fading === fresh ? fading : undefined;
};

/** A filter matching the countries recommended to visit next, which the globe outlines. */
const useNextFilter = (): Filter => {
	const recommended = useAtomValue(recommendedCodesAtom);
	return useMemo(() => isAnyOf(recommended), [recommended]);
};

/**
 * A filter matching the country to highlight: the one the mouse is over on the globe, or else the
 * one pointed at in the list.
 */
const useHoverFilter = (hoveredCountry: string | undefined): Filter => {
	const pointed = useAtomValue(pointedCountryAtom);
	const highlighted = hoveredCountry ?? pointed ?? undefined;
	return useMemo(() => isCountry(highlighted), [highlighted]);
};

/** How the been layer fills its countries, and which the mine layer outlines. */
interface ComparisonLayers {
	readonly beenPaint: Paint;
	readonly mineFilter: Filter;
}

/**
 * How a shared map set against the reader's own is drawn. The been layer fills those new to the
 * reader in a colour of their own, so the two maps read apart without a layer more to keep in
 * step, and the mine layer outlines those on the reader's map alone. Without a comparison, the been
 * layer fills every country alike and the mine layer has none.
 */
const useComparisonLayers = (): ComparisonLayers => {
	const comparison = useAtomValue(comparisonAtom);
	return useMemo(
		() =>
			comparison === null
				? { beenPaint: BEEN_PAINT, mineFilter: isAnyOf([]) }
				: {
						beenPaint: {
							"fill-color": ["case", isAmong(comparison.theirs), THEIRS, PRIMARY],
							"fill-opacity": BEEN_OPACITY,
						},
						mineFilter: isAnyOf(comparison.mine),
					},
		[comparison],
	);
};

/**
 * The fill layers the globe draws. Filters cannot be transitioned, so a country just ticked fills
 * in on a layer of its own, whose opacity can be: the been layer leaves it out until its stamp
 * moment is over, by when the fresh layer has faded up to the same fill, so the hand back is
 * invisible.
 */
export const useGlobeLayers = (hoveredCountry?: string): GlobeLayers => {
	const selectedCountries = useAtomValue(selectedCountriesAtom);
	const fresh = useAtomValue(stampMomentAtom)?.code;
	const fading = useFadingIn(fresh);

	const beenFilter: Filter = useMemo(
		() => isAnyOf(selectedCountries.filter((code) => code !== fresh)),
		[fresh, selectedCountries],
	);
	const { beenPaint, mineFilter } = useComparisonLayers();
	const freshFilter: Filter = useMemo(
		() => isCountry(fresh !== undefined && selectedCountries.includes(fresh) ? fresh : undefined),
		[fresh, selectedCountries],
	);
	const freshPaint: Paint = useMemo(
		() => ({
			"fill-color": PRIMARY,
			"fill-opacity": fading === undefined ? 0 : BEEN_OPACITY,
			"fill-opacity-transition": { delay: 0, duration: FRESH_FADE_MS },
		}),
		[fading],
	);
	const hoverFilter = useHoverFilter(hoveredCountry);
	const nextFilter = useNextFilter();

	return useMemo(
		() => ({
			beenFilter,
			beenPaint,
			freshFilter,
			freshPaint,
			hitPaint: HIT_PAINT,
			hoverFilter,
			hoverPaint: HOVER_PAINT,
			mineFilter,
			minePaint: MINE_PAINT,
			nextFilter,
			nextPaint: NEXT_PAINT,
		}),
		[beenFilter, beenPaint, freshFilter, freshPaint, hoverFilter, mineFilter, nextFilter],
	);
};
