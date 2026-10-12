import type { WritableAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type { StyleSpecification } from "maplibre-gl";
import type { PropsWithChildren, ReactNode } from "react";
import { vi } from "vitest";

// oxlint-disable-next-line no-explicit-any -- Any is required to allow any atom type. Unfortunately cannot be `unknown`.
type AnyWritableAtom = WritableAtom<unknown, any[], unknown>;

type InferAtomTuples<Tuples> = {
	[Key in keyof Tuples]: Tuples[Key] extends readonly [infer Atom, ...infer Rest]
		? Atom extends WritableAtom<unknown, infer Args, unknown>
			? Rest extends Args
				? readonly [Atom, ...Rest]
				: never
			: never
		: never;
};

// oxlint-disable-next-line no-export -- This is a test utility file.
export const HydrateAtoms = <Tuples extends readonly (readonly [AnyWritableAtom, ...unknown[]])[]>({
	initialValues,
	children,
}: PropsWithChildren<{
	readonly initialValues: InferAtomTuples<Tuples>;
}>): ReactNode => {
	useHydrateAtoms(initialValues);
	return children;
};

// oxlint-disable-next-line no-export -- This is a test utility file.
export const mockMediaQueryList = (matches = false): MediaQueryList => ({
	addEventListener: vi.fn<MediaQueryList["addEventListener"]>(),
	// oxlint-disable-next-line no-deprecated -- Deprecated, but still required by the `MediaQueryList` type.
	addListener: vi.fn<MediaQueryList["addListener"]>(),
	dispatchEvent: vi.fn<MediaQueryList["dispatchEvent"]>(),
	matches,
	media: "",
	onchange: null,
	removeEventListener: vi.fn<MediaQueryList["removeEventListener"]>(),
	// oxlint-disable-next-line no-deprecated -- Deprecated, but still required by the `MediaQueryList` type.
	removeListener: vi.fn<MediaQueryList["removeListener"]>(),
});

// oxlint-disable-next-line no-export -- This is a test utility file.
export const assertDefined = <Value>(value: Value | null | undefined, message: string): Value => {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
	return value;
};

// Shaped like the basemaps the globe loads: fills that draw the world, then the label layers the
// country fill has to stay underneath. Which of them the fill anchors to is the globe's to work
// out, so the test names it only to assert against.
// oxlint-disable-next-line no-export -- This is a test utility file.
export const LABELS_LAYER_ID = "place-labels";
const BASEMAP: StyleSpecification = {
	layers: [
		{ id: "background", type: "background" },
		{ id: "landcover", source: "basemap", type: "fill" },
		{ id: LABELS_LAYER_ID, source: "basemap", type: "symbol" },
		{ id: "poi-labels", source: "basemap", type: "symbol" },
	],
	sources: {
		basemap: { data: { features: [], type: "FeatureCollection" }, type: "geojson" },
	},
	version: 8,
};

const originalFetch = globalThis.fetch.bind(globalThis);

// Answers whichever of CARTO's styles the globe asks for with the stub above, and leaves every
// other request — the atlas, above all — to the network.
// oxlint-disable-next-line no-export -- This is a test utility file.
export const stubBasemap = (): void => {
	vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
		const url = input instanceof globalThis.Request ? input.url : String(input);
		if (url.includes("cartocdn.com")) {
			return new globalThis.Response(JSON.stringify(BASEMAP), {
				headers: { "content-type": "application/json" },
			});
		}
		// Anything that is not the basemap, the atlas above all, still goes to the network.
		const response = await originalFetch(input, init);
		return response;
	});
};
