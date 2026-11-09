import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useWindow } from "./use-window.ts";

/**
 * Whether a media query matches, read from the browser as it renders and kept current as it
 * changes, and `false` while rendering on a server, which has no screen to ask about.
 */
export const useMatchMedia = (query: string): boolean => {
	const window = useWindow();

	const mediaQueryList = useMemo(() => window.matchMedia(query), [query, window]);

	const subscribe = useCallback(
		(onStoreChange: () => void): (() => void) => {
			mediaQueryList.addEventListener("change", onStoreChange);
			return () => {
				mediaQueryList.removeEventListener("change", onStoreChange);
			};
		},
		[mediaQueryList],
	);

	const getSnapshot = useCallback((): boolean => mediaQueryList.matches, [mediaQueryList]);

	const getServerSnapshot = useCallback((): boolean => false, []);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/**
 * Whether the reader has asked for less motion, which every animation that is not needed to follow
 * what happened leaves out, and stops at once if they ask while it plays.
 */
export const useReducedMotion = (): boolean => useMatchMedia("(prefers-reduced-motion: reduce)");
