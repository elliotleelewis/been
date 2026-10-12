import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { ChangeEvent, FC, SubmitEvent } from "react";

import { searchAtom, searchResultsAtom, submitSearchAtom } from "../state/search.ts";
import { MenuBody } from "./menu-body";

interface Props {
	readonly loading?: boolean | undefined;
}

export const Menu: FC<Props> = memo(({ loading = false }) => {
	const searchId = useId();
	const searchLabelId = useId();
	const [search, setSearch] = useAtom(searchAtom);
	const results = useAtomValue(searchResultsAtom);
	const submitSearch = useSetAtom(submitSearchAtom);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setSearch(event.target.value);
		},
		[setSearch],
	);
	const handleSubmit = useCallback(
		(event: SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			submitSearch();
		},
		[submitSearch],
	);

	return (
		<>
			<search className="shrink-0">
				<form onSubmit={handleSubmit}>
					<label id={searchLabelId} htmlFor={searchId} className="sr-only">
						{"Search"}
					</label>
					<input
						id={searchId}
						className="w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-primary/50 focus:ring-inset disabled:hover:cursor-not-allowed dark:bg-zinc-900 dark:text-white"
						type="search"
						placeholder="Search by name or code..."
						value={search}
						onChange={handleChange}
						disabled={loading}
						aria-labelledby={searchLabelId}
						enterKeyHint="done"
					/>
				</form>
			</search>
			<MenuBody loading={loading} results={results} />
		</>
	);
});
Menu.displayName = "Menu";
