import { memo } from "react";
import type { FC } from "react";

import { PRIVACY_PATH } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { CookieFacts } from "./cookie-facts.tsx";
import { LegalPage } from "./legal-page.tsx";
import { LegalSection } from "./legal-section.tsx";
import { StorageClear } from "./storage-clear.tsx";
import { StorageFacts } from "./storage-facts.tsx";
import { BODY_CLASS_NAME, CLOUDFLARE_COOKIES_URL, LINK_CLASS_NAME } from "./types.ts";

/**
 * Everything the site may keep on the reader's device, and a way to clear what the app keeps. What
 * leaves the device is the privacy page's.
 */
export const CookiesPage: FC = memo(() => (
	<LegalPage eyebrow={m.cookies_eyebrow()} heading={m.cookies_heading()} intro={m.cookies_intro()}>
		<p className="mt-4">
			<a href={PRIVACY_PATH} className={LINK_CLASS_NAME}>
				{m.cookies_privacy_link()}
			</a>
		</p>
		<LegalSection heading={m.cookies_cloudflare_heading()}>
			<p className={BODY_CLASS_NAME}>{m.cookies_cloudflare_body()}</p>
			<CookieFacts />
			<p className="mt-4">
				<a href={CLOUDFLARE_COOKIES_URL} className={LINK_CLASS_NAME}>
					{m.cookies_cloudflare_more()}
				</a>
			</p>
		</LegalSection>
		<LegalSection heading={m.cookies_storage_heading()}>
			<p className={BODY_CLASS_NAME}>{m.cookies_storage_body()}</p>
			<StorageFacts />
			<p className={BODY_CLASS_NAME}>{m.cookies_storage_warning()}</p>
			<StorageClear />
		</LegalSection>
		<LegalSection heading={m.cookies_nothing_else_heading()}>
			<p className={BODY_CLASS_NAME}>{m.cookies_nothing_else_body()}</p>
		</LegalSection>
	</LegalPage>
));
CookiesPage.displayName = "CookiesPage";
