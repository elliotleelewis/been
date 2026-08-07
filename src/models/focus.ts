import type { Country } from "./country";

/**
 * What the map's camera should do next.
 *
 * `country` frames a country the user has just selected, `undo` puts the camera back where it
 * was before that framing, so unselecting a country reverses the zoom it caused.
 */
export type Focus = { type: "country"; country: Country } | { type: "undo" };
