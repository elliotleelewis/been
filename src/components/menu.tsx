import { useAtomValue } from "jotai";
import { memo, useId, useMemo, useState } from "react";
import type { FC } from "react";

import type { Region } from "../models/region";
import { regionsAtom } from "../state/atoms.ts";
import { MenuBody } from "./menu-body";

interface Props {
	readonly loading?: boolean | undefined;
}

export const Menu: FC<Props> = memo(({ loading = false }) => {
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
			.map((region): Region => ({
				complete: region.complete ?? 0,
				name: region.name,
				values: region.values.filter(({ name }) => name.toLowerCase().includes(searchTerm)),
			}))
			.filter((region) => region.values.length > 0);
	}, [search, regions]);

	return (
		<>
			<form className="shrink-0">
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
			<MenuBody loading={loading} regions={filteredRegions} />
		</>
	);
});
Menu.displayName = "Menu";
