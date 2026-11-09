import { atomWithStorage } from "jotai/utils";

import { STORAGE_KEYS } from "../core/storage.ts";
import { MENU_SIZE_DEFAULT } from "./types.ts";
import type { MenuSize } from "./types.ts";

/**
 * Where the user dragged the edge of the country drawer to, kept so it is still there next time.
 */
export const menuSizeAtom = atomWithStorage<MenuSize>(
	STORAGE_KEYS.menuSize,
	MENU_SIZE_DEFAULT,
	undefined,
	{ getOnInit: true },
);
