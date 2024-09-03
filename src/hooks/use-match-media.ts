import { useEffect, useState } from 'react';

export const useMatchMedia = (query: string) => {
	const getInitialMatches = () => window.matchMedia(query).matches;

	const [matches, setMatches] = useState<boolean>(getInitialMatches);

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
	}, [query]);

	return matches;
};
