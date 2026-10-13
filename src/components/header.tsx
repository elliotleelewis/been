import { memo } from "react";
import type { FC } from "react";

import { PassportButton } from "./passport-button";
import { ShareButton } from "./share-button";

/** The title bar: the app's name, with the passport and sharing at its end. */
export const Header: FC = memo(() => (
	<div className="relative flex h-header items-center justify-center bg-primary text-white md:col-start-1 dark:bg-zinc-950 dark:text-primary">
		<h1 className="select-none font-bold text-xl tracking-wide">{"been"}</h1>
		<div className="absolute end-2 flex items-center gap-1">
			<PassportButton />
			<ShareButton />
		</div>
	</div>
));
Header.displayName = "Header";
