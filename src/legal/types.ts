import { STORAGE_KEYS } from "../core/storage.ts";
import { m } from "../paraglide/messages.js";

/** The day the privacy policy last changed in substance, as an ISO 8601 date. Bump it when it does. */
export const PRIVACY_UPDATED = "2026-11-09";

/** Pages elsewhere that the legal pages point to. */
export const CLOUDFLARE_PRIVACY_URL = "https://www.cloudflare.com/privacypolicy/";
export const CLOUDFLARE_COOKIES_URL =
	"https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/";
export const CARTO_PRIVACY_URL = "https://carto.com/privacy";
export const CONTACT_URL = "https://www.linkedin.com/in/elliotleelewis";

/** Something the app keeps in local storage, by its key, and what it is, for the cookies page. */
export interface StoredThing {
	readonly key: string;
	readonly what: () => string;
}

/** Everything the app keeps in local storage, which a test holds to every key in `STORAGE_KEYS`. */
export const STORED_THINGS: readonly StoredThing[] = [
	{ key: STORAGE_KEYS.countries, what: m.cookies_storage_countries },
	{ key: STORAGE_KEYS.expandedRegions, what: m.cookies_storage_expanded_regions },
	{ key: STORAGE_KEYS.menuSize, what: m.cookies_storage_menu_size },
];

/** A link in the legal pages' running text. */
export const LINK_CLASS_NAME =
	"font-semibold text-primary underline underline-offset-4 hover:text-zinc-900 focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:outline-none dark:hover:text-white";

/** A paragraph of the legal pages' running text. */
export const BODY_CLASS_NAME = "mt-4 leading-relaxed text-zinc-700 dark:text-zinc-300";

/** A box of facts, a term beside each answer on wide screens. */
export const FACTS_CLASS_NAME =
	"mt-6 grid gap-x-6 gap-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:grid-cols-[auto_1fr] dark:border-zinc-700 dark:bg-zinc-800";
