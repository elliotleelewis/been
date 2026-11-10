import { memo } from "react";
import type { FC } from "react";

import { MenuLoading } from "../menu/menu-loading.tsx";
import { SEARCH_INPUT_CLASS_NAME } from "../menu/types.ts";
import { m } from "../paraglide/messages.js";
import { HeaderBar } from "./header-bar.tsx";
import {
	APP_GRID_CLASS_NAME,
	GLOBE_AREA_CLASS_NAME,
	MENU_AREA_CLASS_NAME,
	MENU_CONTENT_CLASS_NAME,
} from "./types.ts";

/**
 * The map's page before it has loaded, which the build renders into its HTML: the title bar, the
 * drawer with its search box and a spinner, and the globe's space, laid out as the app is. Nothing
 * in it is the reader's, so it is the same for everyone. The drawer takes the size the reader left
 * it at from the custom properties `src/app/menu-size.ts` sets before the page is painted.
 */
export const AppLoading: FC = memo(() => (
	<div className={APP_GRID_CLASS_NAME}>
		<HeaderBar />
		<div className={MENU_AREA_CLASS_NAME}>
			<div className={MENU_CONTENT_CLASS_NAME}>
				<input
					className={SEARCH_INPUT_CLASS_NAME}
					type="search"
					placeholder={m.menu_search_placeholder()}
					aria-label={m.menu_search_label()}
					disabled
				/>
				<MenuLoading />
			</div>
		</div>
		<div className={GLOBE_AREA_CLASS_NAME} />
	</div>
));
AppLoading.displayName = "AppLoading";
