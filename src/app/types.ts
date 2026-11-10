/**
 * The page's grid: the title bar, the country drawer and the globe, the drawer a sheet below the
 * globe on narrow screens and a column beside it on wide ones, sized by `--menu-height` and
 * `--menu-width`. The app and its loading screen are laid out by it alike.
 */
export const APP_GRID_CLASS_NAME =
	"grid size-full grid-rows-[auto_minmax(0,1fr)_min(var(--menu-height),calc(100%_-_var(--spacing-header)))] md:grid-cols-[var(--menu-width)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] dark:bg-zinc-900 dark:text-white";

/** Where the country drawer sits in the grid, with its handle on the edge that faces the globe. */
export const MENU_AREA_CLASS_NAME =
	"z-10 row-start-3 flex min-h-0 flex-col-reverse overflow-hidden md:col-start-1 md:row-start-2 md:flex-row dark:bg-zinc-900 dark:text-white";

/** The drawer's contents, beside or above its handle. */
export const MENU_CONTENT_CLASS_NAME = "flex min-h-0 min-w-0 flex-1 flex-col";

/** Where the globe sits in the grid. */
export const GLOBE_AREA_CLASS_NAME =
	"relative row-start-2 md:col-start-2 md:row-span-2 md:row-start-1";
