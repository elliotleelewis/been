import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useId } from "react";
import type { ChangeEvent, FC, SubmitEvent } from "react";

import { m } from "../paraglide/messages.js";
import { MenuBody } from "./menu-body.tsx";
import { searchAtom, searchResultsAtom, submitSearchAtom } from "./search.ts";
import { SharedMapBanner } from "./shared-map-banner.tsx";
import { SEARCH_BOX_CLASS_NAME, SEARCH_INPUT_CLASS_NAME } from "./types.ts";

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
			{/* The search box scrolls with the list, stuck at its top, so the headings stuck under it
			move with it. It sticks a pixel above the top, into its own pixel of padding: iOS Safari
			rounds the list's top edge and what is stuck to it to the screen's pixels apart, which
			would otherwise leave a sliver of the list showing above the box. */}
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
				<search className={classNames("sticky -top-px z-20", SEARCH_BOX_CLASS_NAME)}>
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
