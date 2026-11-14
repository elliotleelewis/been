import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { homeRegionAtom } from "../core/home-region.ts";
import { InRouter } from "../core/in-router.tsx";
import { visitsAtom } from "../core/selection.ts";
import { leaveSharedMap, openSharedMap } from "../core/test.ts";
import type { Visits } from "../core/types.ts";
import { Menu } from "./menu.tsx";

/**
 * Renders the menu on a shared map of France and Italy, against the reader's own `mine`, or on the
 * reader's own map after leaving it, if `left`.
 */
const renderShared = (mine: Visits, left = false): ReturnType<typeof render> => {
	const store = createStore();
	store.set(homeRegionAtom, "150");
	store.set(rawCountriesAtom, {
		ES: { iso3166: "ES", region: "150", subregion: "039" },
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		IT: { iso3166: "IT", region: "150", subregion: "039" },
		JP: { iso3166: "JP", region: "142", subregion: "030" },
	});
	store.set(visitsAtom, mine);
	openSharedMap(store, { FR: {}, IT: {} });
	if (left) {
		leaveSharedMap(store);
	}
	return render(
		<Provider store={store}>
			<InRouter>
				<Menu />
			</InRouter>
		</Provider>,
	);
};

/** What the rows of the country list say, in order, those recommended included. */
const listed = (result: ReturnType<typeof render>): readonly string[] =>
	result
		.getAllByRole("checkbox")
		.filter((checkbox) => /^[A-Z]{2}$/u.test(checkbox.id))
		.map((checkbox) => checkbox.closest("label")?.textContent ?? "");

describe("shared map banner", () => {
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should say how a shared map compares with the reader's own", () => {
		expect.hasAssertions();

		const result = renderShared({ ES: {}, FR: {} });

		expect(result.getByRole("button", { name: "1 in common" })).toBeVisible();
		expect(result.getByRole("button", { name: "1 new to you" })).toBeVisible();
		expect(result.getByRole("button", { name: "1 only you" })).toBeVisible();
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should recommend from the shared map's countries new to the reader", () => {
		expect.hasAssertions();

		const result = renderShared({ ES: {}, FR: {} });

		expect(result.getByText("From their map")).toBeVisible();
		expect(listed(result)[0]).toMatch(/^Italy.*New to you$/u);
	}, 5000);

	it("should narrow the list to a standing, until it is pressed again", () => {
		expect.hasAssertions();

		const result = renderShared({ ES: {}, FR: {} });
		const newToMe = result.getByRole("button", { name: "1 new to you" });
		act(() => {
			newToMe.click();
		});

		expect(newToMe).toHaveAttribute("aria-pressed", "true");
		expect(listed(result)).toStrictEqual(["ItalyNew to you"]);

		act(() => {
			newToMe.click();
		});

		expect(listed(result)).toContain("SpainOnly you");
	}, 5000);

	it("should offer to start a map of the reader's own when they have none", () => {
		expect.hasAssertions();

		const result = renderShared({});

		expect(result.getByRole("link", { name: "Start your own map" })).toBeVisible();
		expect(result.getByText(/then come back to see how your map compares/u)).toBeVisible();
		expect(result.queryByRole("button", { name: /in common/u })).toBeNull();
		expect(result.queryByText("You too")).toBeNull();
	}, 5000);

	it("should offer the way back to compare, once the reader has left with a map of their own", () => {
		expect.hasAssertions();

		const result = renderShared({ ES: {} }, true);
		const compare = result.getByRole("link", { name: "Compare" });

		expect(compare).toBeVisible();
		expect(compare.getAttribute("href")).toMatch(/#share=/u);
		expect(result.queryByText("Viewing a shared map")).toBeNull();
	}, 5000);

	it("should not offer to compare a shared map with no map of the reader's own", () => {
		expect.hasAssertions();

		const result = renderShared({}, true);

		expect(result.queryByRole("link", { name: "Compare" })).toBeNull();
	}, 5000);
});
