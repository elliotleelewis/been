import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { FACTS_CLASS_NAME } from "./types.ts";

/** Cloudflare's security cookie, set out as what it is called, who sets it, why, and for how long. */
export const CookieFacts: FC = memo(() => (
	<dl className={FACTS_CLASS_NAME}>
		<dt className="font-semibold">{m.cookies_name()}</dt>
		<dd className="font-mono text-sm">{"cf_clearance"}</dd>
		<dt className="font-semibold">{m.cookies_set_by()}</dt>
		<dd>{m.cookies_set_by_value()}</dd>
		<dt className="font-semibold">{m.cookies_purpose()}</dt>
		<dd>{m.cookies_purpose_value()}</dd>
		<dt className="font-semibold">{m.cookies_kept_for()}</dt>
		<dd>{m.cookies_kept_for_value()}</dd>
	</dl>
));
CookieFacts.displayName = "CookieFacts";
