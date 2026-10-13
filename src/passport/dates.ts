import { atom } from "jotai";

import { localesAtom } from "../core/countries.ts";

/**
 * Writes a visit's ISO 8601 day the way the passport dates its stamps and visas, such as
 * "13 OCT 2026", in the reader's language, or gives nothing for a visit with no day.
 */
export const passportDateOfAtom = atom((get) => {
	const dates = new Intl.DateTimeFormat(get(localesAtom), {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	return (at: string | undefined): string | undefined =>
		at === undefined ? undefined : dates.format(new Date(`${at}T00:00:00`)).toUpperCase();
});
