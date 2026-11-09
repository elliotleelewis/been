import {
	RouterContextProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from "@tanstack/react-router";
import { memo, useMemo } from "react";
import type { FC, PropsWithChildren } from "react";

/**
 * Puts its children in reach of a router, as a `Link` needs, without the app's routes: one in
 * memory, at the root, so a test can render a component with links as it would any other.
 */
export const InRouter: FC<PropsWithChildren> = memo(({ children }) => {
	const router = useMemo(
		() => createRouter({ history: createMemoryHistory(), routeTree: createRootRoute() }),
		[],
	);
	return <RouterContextProvider router={router}>{children}</RouterContextProvider>;
});
InRouter.displayName = "InRouter";
