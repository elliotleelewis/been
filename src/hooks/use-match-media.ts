import { useEffect, useState } from 'react';
import { useWindow } from './use-window';

export const useMatchMedia = (query: string) => {
	const window = useWindow();

	const [matches, setMatches] = useState<boolean>(
		() => window.matchMedia(query).matches,
	);

	useEffect(() => {
		const handleChange = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		const mediaQueryList = window.matchMedia(query);
		setMatches(mediaQueryList.matches);

		mediaQueryList.addEventListener('change', handleChange);
		return () => {
			mediaQueryList.removeEventListener('change', handleChange);
		};
	}, [window, query]);

	return matches;
};
