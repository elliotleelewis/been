import type { Visit } from "../core/types.ts";

// oxlint-disable-next-line no-explicit-any -- Generic extends requires any
export type ForwardedRefFunction<Fn extends (...args: any[]) => any> = (
	...params: Parameters<Fn>
) => ReturnType<Fn> | undefined;

/**
 * A country the reader ticked or unticked by tapping it on the globe, and the visit it had before,
 * which is everything an undo needs to put it back.
 */
export interface Tap {
	readonly code: string;
	readonly previous: Visit | undefined;
}

export const MapSourceKeys = {
	Countries: "countries",
} as const;

export const MapLayerKeys = {
	Been: "been",
	Fresh: "fresh",
	Hit: "hit",
	Hover: "hover",
} as const;
