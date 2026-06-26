import { useSyncExternalStore, useCallback, useMemo } from "react";
import { useWindow } from "./use-window";

export const useMatchMedia = (query: string) => {
	const window = useWindow();

	const mediaQueryList = useMemo(() => {
		if (typeof window === "undefined") return null;
		return window.matchMedia(query);
	}, [query, window]);

	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			if (!mediaQueryList) return () => {};

			mediaQueryList.addEventListener("change", onStoreChange);
			return () => {
				mediaQueryList.removeEventListener("change", onStoreChange);
			};
		},
		[mediaQueryList],
	);

	const getSnapshot = useCallback(() => {
		return mediaQueryList ? mediaQueryList.matches : false;
	}, [mediaQueryList]);

	const getServerSnapshot = useCallback(() => false, []);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
