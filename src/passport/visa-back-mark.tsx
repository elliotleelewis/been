import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";

/**
 * A tick beside a country on a visa's back that the reader's own map has too, while a shared map is
 * set against it, which says so to someone who can't see it.
 */
export const VisaBackMark: FC = memo(() => (
	<span className="ms-[1cqw] font-extrabold text-current">
		<span aria-hidden="true">{"✓"}</span>
		<span className="sr-only">{m.passport_visa_you_too()}</span>
	</span>
));
VisaBackMark.displayName = "VisaBackMark";
