import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { visitsAtom } from "../core/selection.ts";
import { TODAY, freezeToday } from "../core/test.ts";
import type { Country } from "../core/types.ts";
import { MenuNoResults } from "./menu-no-results.tsx";
import { searchAtom } from "./search.ts";

const france: Country = { iso3166: "FR", name: "France", region: "150", subregion: "155" };

const renderNoResults = (
	suggestions: readonly Country[],
): {
	readonly result: ReturnType<typeof render>;
	readonly store: ReturnType<typeof createStore>;
} => {
	const store = createStore();
	store.set(searchAtom, "frnace");
	const result = render(
		<Provider store={store}>
			<MenuNoResults query="frnace" suggestions={suggestions} />
		</Provider>,
	);
	return { result, store };
};

describe("menu no results", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		vi.useRealTimers();
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should say what found nothing, and offer the near misses", () => {
		expect.hasAssertions();

		const { result } = renderNoResults([france]);

		expect(result.getByText("No countries match “frnace”.")).toBeInTheDocument();
		expect(result.getByRole("heading", { name: "Did you mean" })).toBeInTheDocument();
		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should let a near miss be ticked where it stands", () => {
		expect.hasAssertions();
		freezeToday();

		const { result, store } = renderNoResults([france]);
		act(() => {
			result.getByRole("checkbox", { name: "France" }).click();
		});

		expect(store.get(visitsAtom)).toStrictEqual({ FR: { at: TODAY } });
	}, 5000);

	it("should clear the search", () => {
		expect.hasAssertions();

		const { result, store } = renderNoResults([]);
		act(() => {
			result.getByRole("button", { name: "Clear search" }).click();
		});

		expect(result.queryByRole("heading")).toBeNull();
		expect(store.get(searchAtom)).toBe("");
	}, 5000);
});
