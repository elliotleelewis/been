import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import type { LockedVisaEntry as LockedVisaEntryModel } from "./types.ts";

interface Props {
	readonly entry: LockedVisaEntryModel;
}

/** A country a locked visa still asks for, starred where it is one of those recommended next. */
export const LockedVisaEntry: FC<Props> = memo(({ entry: { country, recommended } }) => (
	<li className={`truncate ${recommended ? "font-semibold" : ""}`}>
		{country.name}
		{recommended ? (
			<span className="ms-[1cqw] text-current" aria-hidden="true">
				{"★"}
			</span>
		) : null}
		{recommended ? <span className="sr-only">{m.passport_visa_next_up()}</span> : null}
	</li>
));
LockedVisaEntry.displayName = "LockedVisaEntry";
