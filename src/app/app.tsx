import { useAtomValue } from "jotai";
import { memo, useId } from "react";
import type { FC } from "react";

import { GlobeBackdrop } from "../globe/globe-backdrop.tsx";
import { Globe } from "../globe/globe.tsx";
import { TapToastRegion } from "../globe/tap-toast-region.tsx";
import { MenuPanel } from "../menu/menu-panel.tsx";
import { MenuResizer } from "../menu/menu-resizer.tsx";
import { menuStyleAtom } from "../menu/size.ts";
import { Header } from "./header.tsx";
import {
	APP_GRID_CLASS_NAME,
	GLOBE_AREA_CLASS_NAME,
	MENU_AREA_CLASS_NAME,
	MENU_CONTENT_CLASS_NAME,
} from "./types.ts";

export const App: FC = memo(() => {
	const style = useAtomValue(menuStyleAtom);
	const menuId = useId();

	return (
		<main className={APP_GRID_CLASS_NAME} style={style}>
			<Header />
			<div id={menuId} className={MENU_AREA_CLASS_NAME}>
				<div className={MENU_CONTENT_CLASS_NAME}>
					<MenuPanel />
				</div>
				<MenuResizer controls={menuId} />
			</div>
			<div className={GLOBE_AREA_CLASS_NAME}>
				<GlobeBackdrop />
				<Globe />
				<TapToastRegion />
			</div>
		</main>
	);
});
App.displayName = "App";
