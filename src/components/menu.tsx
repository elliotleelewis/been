import { useAtomValue } from "jotai";
import { memo, useId, useMemo, useState } from "react";
import type { FC } from "react";
import type { Region } from "../models/region";
import { regionsAtom } from "../state/atoms.ts";
import { MenuBody } from "./menu-body";

interface Props {
	readonly loading?: boolean | undefined;
	readonly fullscreen: boolean;
	readonly toggleFullscreen: () => void;
}

export const Menu: FC<Props> = memo(({ loading = false, fullscreen, toggleFullscreen }) => {
	const searchId = useId();
	const searchLabelId = useId();
	const regions = useAtomValue(regionsAtom);

	const [search, setSearch] = useState("");
	const filteredRegions = useMemo(() => {
		const searchTerm = search.trim().toLowerCase();
		if (!searchTerm) {
			return regions;
		}
		return regions
			.map(
				(region): Region => ({
					complete: region.complete ?? 0,
					name: region.name,
					values: region.values.filter(({ name }) => name.toLowerCase().includes(searchTerm)),
				}),
			)
			.filter((region) => region.values.length > 0);
	}, [search, regions]);

	return (
		<>
			<div className="flex border-zinc-200 border-t-2 sm:border-t-0 dark:border-zinc-700">
				<form className="w-full">
					<label id={searchLabelId} htmlFor={searchId} className="sr-only">
						{"Search"}
					</label>
					<input
						id={searchId}
						className="w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-primary/50 focus:ring-inset disabled:hover:cursor-not-allowed dark:bg-zinc-900 dark:text-white"
						type="text"
						placeholder="Search..."
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
						disabled={loading}
						aria-labelledby={searchLabelId}
					/>
				</form>
				<button type="button" className="visible p-2 md:hidden" onClick={toggleFullscreen}>
					{fullscreen ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="size-4"
						>
							<title>Contract</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="size-4"
						>
							<title>Expand</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
							/>
						</svg>
					)}
				</button>
			</div>
			<MenuBody loading={loading} regions={filteredRegions} />
		</>
	);
});
Menu.displayName = "Menu";
