import classNames from 'classnames';
import { useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { rawCountriesAtom } from '../state/atoms.ts';
import { Globe } from './globe';
import { Menu } from './menu';

export const App: FC = memo(() => {
	const setRawCountries = useSetAtom(rawCountriesAtom);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>();

	const [menuFullscreen, setMenuFullscreen] = useState(false);

	useEffect(() => {
		import('../data/countries')
			.then(({ countries }) => {
				const countryMap = Object.fromEntries(
					countries.map((c) => [c.iso3166, c]),
				);
				setRawCountries(countryMap);
				setLoading(false);
			})
			.catch((error) => {
				setError(error);
			});
	}, [setRawCountries]);

	const reload = useCallback(() => {
		window.location.reload();
	}, []);

	const toggleMenuFullscreen = useCallback(() => {
		setMenuFullscreen((val) => !val);
	}, []);

	return (
		<div className="grid size-full grid-rows-[auto,1fr,auto] md:grid-cols-3 md:grid-rows-[auto,1fr] dark:bg-zinc-900 dark:text-white">
			<div className="flex items-center justify-center bg-primary p-3 text-white md:col-span-1 dark:bg-zinc-950 dark:text-primary">
				<h1 className="select-none font-bold text-xl tracking-wide">
					been
				</h1>
			</div>
			<div
				className={classNames(
					'z-10 order-3 flex flex-col overflow-auto md:order-2 md:col-span-1 md:row-start-2 dark:bg-zinc-900 dark:text-white',
					menuFullscreen && '-mt-[60vh] md:mt-0',
				)}
			>
				{error ? (
					<div className="flex size-full flex-col items-center justify-center gap-2 px-2 text-center text-lg">
						<span>
							Oops! Something went wrong whilst loading the list
							of countries.
						</span>
						<button
							type="button"
							className="items-center justify-center rounded-md border border-primary px-6 py-2 text-primary transition focus:ring-2 focus:ring-primary/50 active:ring-primary"
							onClick={reload}
						>
							Try again
						</button>
					</div>
				) : (
					<Menu
						loading={loading}
						fullscreen={menuFullscreen}
						toggleFullscreen={toggleMenuFullscreen}
					/>
				)}
			</div>
			<div className="order-2 min-h-[60vh] md:order-3 md:col-span-2 md:row-span-2">
				<Globe />
			</div>
		</div>
	);
});
App.displayName = 'App';
