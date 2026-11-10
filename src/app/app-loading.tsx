import { memo } from "react";
import type { FC } from "react";

import { GlobeBackdrop } from "../globe/globe-backdrop.tsx";
import { MenuLoading } from "../menu/menu-loading.tsx";
import { menuStyleOf } from "../menu/menu-style.ts";
import {
	GRIP_CLASS_NAME,
	MENU_SIZE_DEFAULT,
	RESIZER_CLASS_NAME,
	SEARCH_INPUT_CLASS_NAME,
} from "../menu/types.ts";
import { m } from "../paraglide/messages.js";
import { HeaderBar } from "./header-bar.tsx";
import { HeaderPlaceholder } from "./header-placeholder.tsx";
import {
	APP_GRID_CLASS_NAME,
	GLOBE_AREA_CLASS_NAME,
	MENU_AREA_CLASS_NAME,
	MENU_CONTENT_CLASS_NAME,
} from "./types.ts";

/** The drawer at the size it always opens at, as the app sizes it too. */
const DEFAULT_STYLE = menuStyleOf(MENU_SIZE_DEFAULT);

/**
 * The map's page before it has loaded, which the build renders into its HTML: the title bar and its
 * icons, the drawer with its search box, a spinner and its handle, and the globe as it opens, laid
 * out as the app is, the drawer at the size it always opens at. Nothing in it is the reader's, so
 * it is the same for everyone, but for a share link, which has no sharing icon: the script
 * `src/app/before-paint.ts` marks one before the page is painted.
 */
export const AppLoading: FC = memo(() => (
	<div className={APP_GRID_CLASS_NAME} style={DEFAULT_STYLE}>
		<HeaderBar>
			<HeaderPlaceholder />
		</HeaderBar>
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
			<div className={RESIZER_CLASS_NAME} aria-hidden="true">
				<div className={GRIP_CLASS_NAME} />
			</div>
		</div>
		<div className={GLOBE_AREA_CLASS_NAME}>
			<GlobeBackdrop />
		</div>
	</div>
));
AppLoading.displayName = "AppLoading";
