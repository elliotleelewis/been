import { memo } from "react";
import type { FC } from "react";

import { GlobeBackdrop } from "../globe/globe-backdrop.tsx";
import { MenuLoading } from "../menu/menu-loading.tsx";
import { GRIP_CLASS_NAME, RESIZER_CLASS_NAME, SEARCH_INPUT_CLASS_NAME } from "../menu/types.ts";
import { m } from "../paraglide/messages.js";
import { HeaderBar } from "./header-bar.tsx";
import { HeaderPlaceholder } from "./header-placeholder.tsx";
import {
	APP_GRID_CLASS_NAME,
	GLOBE_AREA_CLASS_NAME,
	MENU_AREA_CLASS_NAME,
	MENU_CONTENT_CLASS_NAME,
} from "./types.ts";

/**
 * The map's page before it has loaded, which the build renders into its HTML: the title bar and its
 * icons, the drawer with its search box, a spinner and its handle, and the globe as it opens, laid
 * out as the app is. Nothing in it is the reader's, so it is the same for everyone. The script
 * `src/app/before-paint.ts` runs before it is painted, sizing the drawer as the reader left it and
 * marking a share link, which has no sharing icon.
 */
export const AppLoading: FC = memo(() => (
	<div className={APP_GRID_CLASS_NAME}>
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
