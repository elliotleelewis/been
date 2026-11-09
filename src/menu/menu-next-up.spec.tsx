import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { localesAtom } from "../core/countries.ts";
import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { MenuNextUp } from "./menu-next-up.tsx";

/** Renders what the menu recommends after a trip to France, with Belgium and Luxembourg beside it. */
const renderNextUp = (visited: boolean): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(rawCountriesAtom, {
		BE: { iso3166: "BE", neighbours: ["FR", "LU"], region: "150", subregion: "155" },
		FR: { iso3166: "FR", neighbours: ["BE", "LU"], region: "150", subregion: "155" },
		LU: { iso3166: "LU", neighbours: ["BE", "FR"], region: "150", subregion: "155" },
	});
	store.set(visitsAtom, visited ? { FR: { at: "2026-10-13" } } : {});
	render(
		<Provider store={store}>
			<ul>
				<MenuNextUp />
			</ul>
		</Provider>,
	);
	return store;
};

describe("menu next up", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should recommend the countries next door, say why, and tick them like any other", () => {
		expect.hasAssertions();

		const store = renderNextUp(true);
		const belgium = globalThis.document.querySelector<HTMLInputElement>("input#BE");

		expect(globalThis.document.body).toHaveTextContent("Next up");
		expect(globalThis.document.body).toHaveTextContent("2 to go for Europe · Borders France");

		act(() => {
			belgium?.click();
		});

		expect(Object.keys(store.get(visitsAtom))).toStrictEqual(["FR", "BE"]);
	}, 5000);

	it("should recommend nothing before anything is ticked", () => {
		expect.hasAssertions();

		renderNextUp(false);

		expect(globalThis.document.body).not.toHaveTextContent("Next up");
	}, 5000);
});
