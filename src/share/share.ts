import { atom } from "jotai";

import { countryCodesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { encodeShare, shareUrlOf } from "../core/share-link.ts";

/** A link that opens the reader's own map, read-only, for whoever they send it to. */
export const shareUrlAtom = atom((get) =>
	shareUrlOf(encodeShare(get(visitsAtom), get(countryCodesAtom)), globalThis.location),
);

/** How many countries the reader's own map has ticked, which the share dialog says it is sending. */
export const visitedCountAtom = atom((get) => Object.keys(get(visitsAtom)).length);
