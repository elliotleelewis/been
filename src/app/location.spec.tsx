import {
	RouterContextProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { locationHashAtom, viewingSharedMapAtom } from "../core/location.ts";
import { encodeShare, shareHashOf } from "../core/share-link.ts";
import { SharedMapBanner } from "../menu/shared-map-banner.tsx";
import { mirrorLocation } from "./location.ts";

/** A router with no routes but the root, in memory, starting at `path`. */
// oxlint-disable-next-line explicit-function-return-type -- The router's type is all generics, best left to inference.
const createMemoryRouter = (path: string) =>
	createRouter({
		history: createMemoryHistory({ initialEntries: [path] }),
		routeTree: createRootRoute(),
	});

/** A router in memory, its location mirrored into a store, and what stops the mirror. */
interface Mirrored {
	readonly router: ReturnType<typeof createMemoryRouter>;
	readonly store: ReturnType<typeof createStore>;
	readonly stop: () => void;
}

/** A router in memory, starting at `path`, mirrored into a store with a two-country list. */
const createMirrored = (path: string): Mirrored => {
	const router = createMemoryRouter(path);
	const store = createStore();
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		IT: { iso3166: "IT", region: "150", subregion: "039" },
	});
	const stop = mirrorLocation(router.history, store);
	return { router, stop, store };
};

/** A link to a map of France, against the two-country list. */
const LINK = `/#${shareHashOf(encodeShare({ FR: {} }, ["FR", "IT"]))}`;

describe("mirrorLocation", () => {
	afterEach(() => {
		cleanup();
	});

	it("should open on the map the router starts at, before anything renders", () => {
		expect.hasAssertions();

		const { stop, store } = createMirrored(LINK);

		expect(store.get(viewingSharedMapAtom)).toBeTruthy();

		stop();
	}, 5000);

	it("should follow the router as it navigates, back and forward included", () => {
		expect.hasAssertions();

		const { router, stop, store } = createMirrored("/");
		router.history.push(LINK);

		expect(store.get(viewingSharedMapAtom)).toBeTruthy();

		router.history.back();

		expect(store.get(locationHashAtom)).toBe("");

		stop();
	}, 5000);

	it("should leave a shared map by navigating, without keeping the link in history", async () => {
		expect.hasAssertions();

		const { router, stop, store } = createMirrored(LINK);
		const result = render(
			<RouterContextProvider router={router}>
				<Provider store={store}>
					<SharedMapBanner />
				</Provider>
			</RouterContextProvider>,
		);
		const leave = result.getByRole("link", { name: "Start your own map" });

		expect(leave).not.toHaveAttribute("aria-current");

		leave.click();
		await waitFor(() => {
			expect(store.get(viewingSharedMapAtom)).toBeFalsy();
		});

		expect(router.history.location.hash).toBe("");
		expect(router.history.canGoBack()).toBeFalsy();

		stop();
	}, 5000);
});
