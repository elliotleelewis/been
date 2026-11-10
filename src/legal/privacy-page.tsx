import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { getLocale } from "../paraglide/runtime.js";
import { LegalPage } from "./legal-page.tsx";
import { LegalSection } from "./legal-section.tsx";
import {
	BODY_CLASS_NAME,
	CARTO_PRIVACY_URL,
	CLOUDFLARE_PRIVACY_URL,
	CONTACT_URL,
	LINK_CLASS_NAME,
	PRIVACY_UPDATED,
} from "./types.ts";

/** The day the policy last changed, as the reader writes dates. */
const updated = new Intl.DateTimeFormat(getLocale(), { dateStyle: "long", timeZone: "UTC" }).format(
	new Date(PRIVACY_UPDATED),
);

/**
 * The privacy policy: what leaves the reader's device, who sees it and what for, and how to ask
 * about it. What stays on the device is the cookies page's.
 */
export const PrivacyPage: FC = memo(() => (
	<LegalPage eyebrow={m.privacy_eyebrow()} heading={m.privacy_heading()} intro={m.privacy_intro()}>
		<p className="mt-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
			{m.privacy_updated({ date: updated })}
		</p>
		<p className="mt-4">
			<Link to="/cookies" hash className={LINK_CLASS_NAME}>
				{m.privacy_cookies_link()}
			</Link>
		</p>
		<LegalSection heading={m.privacy_visits_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_visits_body()}</p>
			<p className={BODY_CLASS_NAME}>{m.privacy_analytics_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_map_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_map_body()}</p>
			<p className={BODY_CLASS_NAME}>{m.privacy_share_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_globe_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_globe_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_others_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_others_body()}</p>
			<ul className="mt-4 flex flex-col gap-2">
				<li>
					<a href={CLOUDFLARE_PRIVACY_URL} className={LINK_CLASS_NAME}>
						{m.privacy_cloudflare_link()}
					</a>
				</li>
				<li>
					<a href={CARTO_PRIVACY_URL} className={LINK_CLASS_NAME}>
						{m.privacy_carto_link()}
					</a>
				</li>
			</ul>
		</LegalSection>
		<LegalSection heading={m.privacy_use_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_use_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_signals_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_signals_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_rights_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_rights_body()}</p>
			<p className="mt-4">
				<a href={CONTACT_URL} className={LINK_CLASS_NAME}>
					{m.privacy_contact()}
				</a>
			</p>
		</LegalSection>
		<LegalSection heading={m.privacy_children_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_children_body()}</p>
		</LegalSection>
		<LegalSection heading={m.privacy_changes_heading()}>
			<p className={BODY_CLASS_NAME}>{m.privacy_changes_body()}</p>
		</LegalSection>
	</LegalPage>
));
PrivacyPage.displayName = "PrivacyPage";
