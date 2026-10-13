import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { ChangeEvent, FC, SubmitEvent } from "react";

import { m } from "../paraglide/messages.js";
import { MenuBody } from "./menu-body.tsx";
import { searchAtom, searchResultsAtom, submitSearchAtom } from "./search.ts";
import { SharedMapBanner } from "./shared-map-banner.tsx";

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
			<SharedMapBanner />
			<search className="shrink-0">
				<form onSubmit={handleSubmit}>
					<label id={searchLabelId} htmlFor={searchId} className="sr-only">
						{m.menu_search_label()}
					</label>
					<input
						id={searchId}
						className="w-full border-none bg-white px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-primary/50 focus:ring-inset disabled:hover:cursor-not-allowed dark:bg-zinc-900 dark:text-white"
						type="search"
						placeholder={m.menu_search_placeholder()}
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
