import { atom } from "jotai";

import { shareUrlOf } from "../utils/share.ts";
import { visitsAtom } from "./atoms.ts";

/** A link that opens the reader's own map, read-only, for whoever they send it to. */
export const shareUrlAtom = atom((get) => shareUrlOf(get(visitsAtom), globalThis.location));

/** How many countries the reader's own map has ticked, which the share dialog says it is sending. */
export const visitedCountAtom = atom((get) => Object.keys(get(visitsAtom)).length);
