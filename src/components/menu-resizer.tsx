import { memo } from "react";
import type { FC } from "react";

import { useMenuResize } from "../hooks/use-menu-resize";

interface Props {
	// The drawer this handle resizes, so a screen reader can say what is being moved.
	readonly controls: string;
}

// The edge the country drawer is dragged by: the seam it shares with the globe, which is its right
// edge as a column and its top edge as a sheet.
export const MenuResizer: FC<Props> = memo(({ controls }) => {
	const { orientation, resizeProps, value, valueMax, valueMin } = useMenuResize();

	return (
		<div
			// oxlint-disable-next-line react/jsx-props-no-spreading -- The handlers `useMove` returns are its interface, and naming them here would freeze a list that is react-aria's to change.
			{...resizeProps}
			// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An `hr` is a thematic break with nowhere to put the grip, and this separator is focusable.
			role="separator"
			tabIndex={0}
			className="group flex shrink-0 cursor-row-resize touch-none select-none items-center justify-center bg-zinc-200 py-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset md:cursor-col-resize md:px-1 md:py-0 dark:bg-zinc-800"
			aria-controls={controls}
			aria-label="Resize the country list"
			aria-orientation={orientation}
			aria-valuemax={valueMax}
			aria-valuemin={valueMin}
			aria-valuenow={value}
		>
			<div className="h-1 w-10 rounded-full bg-zinc-400 transition-colors group-hover:bg-primary md:h-10 md:w-1 dark:bg-zinc-600" />
		</div>
	);
});
MenuResizer.displayName = "MenuResizer";
