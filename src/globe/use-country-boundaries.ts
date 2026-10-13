import { useAtomValue } from "jotai";

import { boundariesAtom } from "../core/dataset.ts";
import type { CountryBoundaries } from "../data/boundaries.ts";

/** The country boundaries, which are an empty collection until the atlas they come from lands. */
export const useCountryBoundaries = (): CountryBoundaries => useAtomValue(boundariesAtom);
