import classNames from "classnames";
import { memo } from "react";
import type { FC } from "react";

import { PassportIcon } from "../passport/passport-icon.tsx";
import { ShareIcon } from "../share/share-icon.tsx";

/** Each icon's space, as its button's, so the icons sit where the buttons will. */
const ICON_CLASS_NAME = "inline-flex rounded-full p-2";

/**
 * The passport and sharing icons at the end of the title bar, before their buttons have loaded. A
 * shared map has no sharing, so on a share link, which the script before the first paint marks the
 * page with, that icon is not drawn. It is a picture only.
 */
export const HeaderPlaceholder: FC = memo(() => (
	<div className="absolute end-2 flex items-center gap-1" aria-hidden="true">
		<span className={ICON_CLASS_NAME}>
			<PassportIcon />
		</span>
		<span className={classNames(ICON_CLASS_NAME, "in-[[data-shared-map]]:hidden")}>
			<ShareIcon />
		</span>
	</div>
));
HeaderPlaceholder.displayName = "HeaderPlaceholder";
