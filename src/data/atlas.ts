import type { Topology } from "topojson-specification";
// The atlas is a ~700kB file, so it is fetched as an asset rather than parsed as part of a chunk.
import atlasUrl from "visionscarto-world-atlas/world/50m.json?url";

// Fetches the Natural Earth atlas the country boundaries are drawn from.
export const loadAtlas = async (signal?: AbortSignal): Promise<Topology> => {
	const response = await globalThis.fetch(atlasUrl, signal === undefined ? {} : { signal });
	if (!response.ok) {
		throw new Error(`The world atlas could not be fetched (${response.status}).`);
	}
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The atlas ships with the app, so its shape is fixed at build time rather than being untrusted input.
	return (await response.json()) as Topology;
};
