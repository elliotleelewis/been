import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { ChangeEvent, FC, SubmitEvent } from "react";

import { m } from "../paraglide/messages.js";
import { MenuBody } from "./menu-body.tsx";
import { searchAtom, searchResultsAtom, submitSearchAtom } from "./search.ts";
import { SharedMapBanner } from "./shared-map-banner.tsx";
import { SEARCH_INPUT_CLASS_NAME } from "./types.ts";

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
			{/* The search box scrolls with the list, stuck at its top, rather than sitting above it: iOS
			Safari can draw a sticky heading a little below the top of the box that scrolls it, and
			one stuck under another in the same box moves with it. The strip above it covers that gap
			above the search box itself. */}
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
				<search className="sticky top-0 z-20 shrink-0 before:absolute before:inset-x-0 before:bottom-full before:h-2 before:bg-white dark:before:bg-zinc-900">
					<form onSubmit={handleSubmit}>
						<label id={searchLabelId} htmlFor={searchId} className="sr-only">
							{m.menu_search_label()}
						</label>
						<input
							id={searchId}
							className={SEARCH_INPUT_CLASS_NAME}
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
			</div>
		</>
	);
});
Menu.displayName = "Menu";
