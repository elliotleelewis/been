import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { localesAtom } from "../core/countries.ts";
import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { PassportLockedPage } from "./passport-locked-page.tsx";

/** Renders the first page of visas within reach of France, among Belgium, Luxembourg and Japan. */
const renderPage = (): ReturnType<typeof render> => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(rawCountriesAtom, {
		BE: { iso3166: "BE", region: "150", subregion: "155" },
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		JP: { iso3166: "JP", region: "142", subregion: "030" },
		LU: { iso3166: "LU", region: "150", subregion: "155" },
	});
	store.set(visitsAtom, { FR: { at: "2026-10-13" } });
	return render(
		<Provider store={store}>
			<PassportLockedPage index={0} />
		</Provider>,
	);
};

describe("passport locked page", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should say how many more a visa needs, and turn over to the countries that would do", () => {
		expect.hasAssertions();

		const result = renderPage();
		const front = result.getByRole("button", { name: /^Europe visa, not yet issued/u });

		expect(front).toHaveAccessibleName(/2 more countries to go$/u);
		expect(front).toHaveTextContent("2 TO GO");

		act(() => {
			front.click();
		});
		const countries = result.getByRole("region", {
			name: "Countries that would earn the Europe visa",
		});

		expect(countries).toHaveTextContent("ANY 2 OF");
		expect(countries).toHaveTextContent("Belgium★, next up");
		expect(result.getByRole("button", { name: "Turn the Europe visa back over" })).toHaveFocus();
	}, 5000);
});
