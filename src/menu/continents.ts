import { atom } from "jotai";

import { collatorAtom, countriesAtom } from "../core/countries.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { regionalizer } from "./regionalizer.ts";

/** The countries folded into their continents and sub-regions, the reader's home continent first. */
export const continentsAtom = atom((get) =>
	regionalizer(get(countriesAtom), get(collatorAtom), get(homeRegionAtom)),
);
