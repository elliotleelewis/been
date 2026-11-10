import { memo, useRef } from "react";
import type { FC } from "react";

import { PassportButton } from "../passport/passport-button.tsx";
import { StampMoment } from "../passport/stamp-moment.tsx";
import { VisaMoment } from "../passport/visa-moment.tsx";
import { ShareButton } from "../share/share-button.tsx";
import { HeaderBar } from "./header-bar.tsx";

/** The title bar: the app's name, with the passport and sharing at its end. */
export const Header: FC = memo(() => {
	// The passport button is what a new stamp flies into, so the stamp moment needs to know where it is.
	const passportRef = useRef<HTMLSpanElement>(null);

	return (
		<HeaderBar>
			<div className="absolute end-2 flex items-center gap-1">
				<span ref={passportRef} className="inline-flex">
					<PassportButton />
				</span>
				<ShareButton />
			</div>
			<StampMoment target={passportRef} />
			<VisaMoment target={passportRef} />
		</HeaderBar>
	);
});
Header.displayName = "Header";
