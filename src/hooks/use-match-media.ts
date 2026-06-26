import { useSyncExternalStore } from "react";
import { useWindow } from "./use-window";

export const useMatchMedia = (query: string) => {
	const window = useWindow();
	
	const subscribe = (onStoreChange: () => void) => {
		const mediaQueryList = window.matchMedia(query);
		mediaQueryList.addEventListener("change", onStoreChange);
		return () => {
			mediaQueryList.removeEventListener("change", onStoreChange);
		};
	};
	
	const getSnapshot = () => window.matchMedia(query).matches;
	
	return useSyncExternalStore(subscribe, getSnapshot);
};
