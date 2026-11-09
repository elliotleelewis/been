import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { useMatchMedia } from "../core/use-match-media.ts";
import { passportSpreadAtom } from "./pages.ts";

/**
 * Screens that can show the passport open at two pages: wide enough that each is no smaller than a
 * phone shows one, and wider than they are tall, so the spread is not left at a fraction of the
 * height.
 */
const SPREAD_QUERY = "(min-width: 40rem) and (min-aspect-ratio: 8/7)";

/** Lays the passport open two pages at a time while the screen is wide enough, and says if it is. */
export const usePassportSpread = (): boolean => {
	const spread = useMatchMedia(SPREAD_QUERY);
	const setSpread = useSetAtom(passportSpreadAtom);
	useEffect(() => {
		setSpread(spread);
	}, [setSpread, spread]);
	return spread;
};
