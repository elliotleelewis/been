import { atom } from "jotai";

import { homeRegionOf } from "./m49.ts";
import type { M49Region } from "./m49.ts";

/** The continent the reader is most likely to be in, which the menu lists first and opens. */
export const homeRegionAtom = atom<M49Region | undefined>(
	homeRegionOf(new Intl.DateTimeFormat().resolvedOptions().timeZone),
);
