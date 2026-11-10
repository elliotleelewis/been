import { memo } from "react";
import type { FC, PropsWithChildren } from "react";

/**
 * The title bar, with the app's name in the middle and whatever is given at its end. The loading
 * screen shows it bare, before the passport and sharing have loaded.
 */
export const HeaderBar: FC<PropsWithChildren> = memo(({ children }) => (
	<div className="relative flex h-header items-center justify-center bg-primary text-white md:col-start-1 dark:bg-zinc-950 dark:text-primary">
		<h1 className="select-none font-bold text-xl tracking-wide">{"been"}</h1>
		{children}
	</div>
));
HeaderBar.displayName = "HeaderBar";
