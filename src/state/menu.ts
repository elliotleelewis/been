import { atomWithStorage } from "jotai/utils";

import { MENU_SIZE_DEFAULT } from "../models/menu.ts";
import type { MenuSize } from "../models/menu.ts";

const MENU_SIZE_STORAGE_KEY = "APP_MENU_SIZE";

/**
 * Where the user dragged the edge of the country drawer to, kept so it is still there next time.
 */
export const menuSizeAtom = atomWithStorage<MenuSize>(
	MENU_SIZE_STORAGE_KEY,
	MENU_SIZE_DEFAULT,
	undefined,
	{ getOnInit: true },
);
