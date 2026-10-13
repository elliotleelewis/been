import { memo, useRef } from "react";
import type { FC } from "react";

import { PassportButton } from "./passport-button";
import { ShareButton } from "./share-button";
import { StampMoment } from "./stamp-moment";

/** The title bar: the app's name, with the passport and sharing at its end. */
export const Header: FC = memo(() => {
	// The passport button is what a new stamp flies into, so the stamp moment needs to know where it is.
	const passportRef = useRef<HTMLSpanElement>(null);

	return (
		<div className="relative flex h-header items-center justify-center bg-primary text-white md:col-start-1 dark:bg-zinc-950 dark:text-primary">
			<h1 className="select-none font-bold text-xl tracking-wide">{"been"}</h1>
			<div className="absolute end-2 flex items-center gap-1">
				<span ref={passportRef} className="inline-flex">
					<PassportButton />
				</span>
				<ShareButton />
			</div>
			<StampMoment target={passportRef} />
		</div>
	);
});
Header.displayName = "Header";
