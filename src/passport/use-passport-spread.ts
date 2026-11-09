import { useMatchMedia } from "../core/use-match-media.ts";

/**
 * Screens that can show the passport open at two pages: wide enough that each is no smaller than a
 * phone shows one, and wider than they are tall, so the spread is not left at a fraction of the
 * height.
 */
const SPREAD_QUERY = "(min-width: 40rem) and (min-aspect-ratio: 8/7)";

/**
 * Whether the passport lies open two pages at a time, as a real one does, which it does while the
 * screen is wide enough. Read from the screen as it renders, and one page at a time on a server.
 */
export const usePassportSpread = (): boolean => useMatchMedia(SPREAD_QUERY);
