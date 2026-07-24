import { useSyncExternalStore, useCallback, useMemo } from "react";
import { useWindow } from "./use-window";

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
