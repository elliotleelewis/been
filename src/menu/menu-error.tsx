import { memo, useCallback } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";

/**
 * What the drawer holds when the country list never arrived. A reload is the whole recovery: the
 * list is a static import, so there is nothing to retry but the page itself.
 */
export const MenuError: FC = memo(() => {
	const reload = useCallback(() => {
		globalThis.location.reload();
	}, []);

	return (
		<div className="flex size-full flex-col items-center justify-center gap-2 px-2 text-center text-lg">
			<span>{m.menu_error()}</span>
			<button
				type="button"
				className="items-center justify-center rounded-md border border-primary px-6 py-2 text-primary transition focus:ring-2 focus:ring-primary/50 active:ring-primary"
				onClick={reload}
			>
				{m.menu_retry()}
			</button>
		</div>
	);
});
MenuError.displayName = "MenuError";
