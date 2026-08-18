import { memo, useCallback } from "react";
import type { FC } from "react";

// What the drawer holds when the country list never arrived. A reload is the whole recovery: the
// list is a static import, so there is nothing to retry but the page itself.
export const MenuError: FC = memo(() => {
	const reload = useCallback(() => {
		globalThis.location.reload();
	}, []);

	return (
		<div className="flex size-full flex-col items-center justify-center gap-2 px-2 text-center text-lg">
			<span>{"Oops! Something went wrong whilst loading the list of countries."}</span>
			<button
				type="button"
				className="items-center justify-center rounded-md border border-primary px-6 py-2 text-primary transition focus:ring-2 focus:ring-primary/50 active:ring-primary"
				onClick={reload}
			>
				{"Try again"}
			</button>
		</div>
	);
});
MenuError.displayName = "MenuError";
