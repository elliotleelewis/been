import { HeadContent, Outlet } from "@tanstack/react-router";
import { memo } from "react";
import type { FC } from "react";

/** The page on show, with the title its route gives it in the browser's tab. */
export const Page: FC = memo(() => (
	<>
		<HeadContent />
		<Outlet />
	</>
));
Page.displayName = "Page";
