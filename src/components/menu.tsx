import { useAtomValue } from 'jotai';
import { memo, useId, useMemo, useState } from 'react';
import type { FC } from 'react';
import { regionsAtom } from '../state/atoms.ts';
import { MenuItem } from './menu-item';
import { Progress } from './progress';

interface Props {
	loading?: boolean;
	fullscreen: boolean;
	toggleFullscreen: () => void;
}

export const Menu: FC<Props> = memo(
	({ loading = false, fullscreen, toggleFullscreen }) => {
		const searchId = useId();
		const regions = useAtomValue(regionsAtom);

		const [search, setSearch] = useState('');
		const filteredRegions = useMemo(() => {
			const s = search.trim().toLowerCase();
			if (!s) {
				return regions;
			}
			return regions
				.map((region) => ({
					...region,
					values: region.values.filter(({ name }) =>
						name.toLowerCase().includes(s),
					),
				}))
				.filter((region) => region.values.length > 0);
		}, [search, regions]);

		return (
			<>
				<div className="flex border-zinc-200 border-t-2 sm:border-t-0 dark:border-zinc-700">
					<form className="w-full">
						<label htmlFor={searchId} className="sr-only">
							Search
						</label>
						<input
							id={searchId}
							className="w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-primary/50 focus:ring-inset disabled:hover:cursor-not-allowed dark:bg-zinc-900 dark:text-white"
							type="text"
							placeholder="Search..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
							}}
							disabled={loading}
						/>
					</form>
					<button
						type="button"
						className="visible p-2 md:hidden"
						onClick={toggleFullscreen}
					>
						{fullscreen ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="size-4"
							>
								<title>Contract</title>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="size-4"
							>
								<title>Expand</title>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
								/>
							</svg>
						)}
					</button>
				</div>
				{loading ? (
					<div className="flex size-full items-center justify-center">
						<svg
							className="size-5 animate-spin text-neutral-800 dark:text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<title>Loading!</title>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				) : (filteredRegions.length === 0 ? (
					<div className="m-4 h-full text-center font-medium">
						No results!
					</div>
				) : (
					<ul className="h-full overflow-y-auto">
						{filteredRegions.map((region) => (
							<li key={region.name}>
								<div className="sticky top-0 flex items-center justify-between bg-zinc-200 p-4 font-medium dark:bg-zinc-800">
									<h2>{region.name || 'Other'}</h2>
									<Progress complete={region.complete ?? 0} />
								</div>
								<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
									{region.values.map((country) => (
										<MenuItem
											key={country.iso3166}
											country={country}
										/>
									))}
								</ul>
							</li>
						))}
					</ul>
				))}
			</>
		);
	},
);
Menu.displayName = 'Menu';
