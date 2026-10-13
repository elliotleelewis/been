import { useAtomValue } from "jotai";

import type { CountryBoundaries } from "../data/boundaries";
import { boundariesAtom } from "../state/dataset.ts";

/** The country boundaries, which are an empty collection until the atlas they come from lands. */
export const useCountryBoundaries = (): CountryBoundaries => useAtomValue(boundariesAtom);
