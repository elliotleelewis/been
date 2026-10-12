import type { Visit } from "./country";

/**
 * A country the reader ticked or unticked by tapping it on the globe, and the visit it had before,
 * which is everything an undo needs to put it back.
 */
export interface Tap {
	readonly code: string;
	readonly previous: Visit | undefined;
}
