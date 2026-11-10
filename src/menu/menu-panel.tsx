import { memo } from "react";
import type { FC } from "react";

import { MenuError } from "./menu-error.tsx";
import { Menu } from "./menu.tsx";
import { useCountries } from "./use-countries.ts";

/**
 * What the drawer holds: the country list, once it has loaded the countries it lists, or what went
 * wrong if it could not.
 */
export const MenuPanel: FC = memo(() => {
	const { error, loading } = useCountries();
	return error ? <MenuError /> : <Menu loading={loading} />;
});
MenuPanel.displayName = "MenuPanel";
