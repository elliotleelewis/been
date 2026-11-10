import { atom } from "jotai";

import { menuStyleOf } from "./menu-style.ts";
import type { MenuStyle } from "./menu-style.ts";
import { MENU_SIZE_DEFAULT } from "./types.ts";
import type { MenuSize } from "./types.ts";

/**
 * Where the reader has dragged the edge of the country drawer to. It is not kept between visits:
 * the drawer opens at the default size every time, the size the page is built at, so nothing moves
 * as it loads.
 */
export const menuSizeAtom = atom<MenuSize>(MENU_SIZE_DEFAULT);

/** The style that sizes the page's grid for the drawer as it is now. */
export const menuStyleAtom = atom<MenuStyle>((get) => menuStyleOf(get(menuSizeAtom)));
