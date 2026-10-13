import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { mockMediaQueryList } from "../core/test.ts";
import { visaMomentAtom } from "./moments.ts";
import { VisaMoment } from "./visa-moment.tsx";

/** Renders the visa moment, as someone who has, or has not, asked for less motion. */
const renderMoment = (reducedMotion: boolean): ReturnType<typeof createStore> => {
	vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList(reducedMotion));
	const store = createStore();
	store.set(rawCountriesAtom, { FR: { iso3166: "FR", region: "150", subregion: "155" } });
	store.set(visitsAtom, { FR: { at: "2026-10-13" } });
	render(
		<Provider store={store}>
			<VisaMoment target={createRef<HTMLElement>()} />
		</Provider>,
	);
	return store;
};

describe("visa moment", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		globalThis.localStorage.clear();
	});

	it("should stick the visas on in a burst of confetti, then let them go", async () => {
		expect.hasAssertions();

		const store = renderMoment(false);
		act(() => {
			store.set(visaMomentAtom, { id: 1, ids: ["milestone:1", "region:150"] });
		});

		expect(globalThis.document.querySelectorAll("[aria-hidden='true'] svg")).toHaveLength(2);

		// Played out to the end at once, rather than waited for, as a busy browser runs them slow.
		for (const animation of globalThis.document.getAnimations()) {
			animation.finish();
		}
		await vi.waitFor(() => {
			expect(store.get(visaMomentAtom)).toBeNull();
		});
	}, 5000);

	it("should skip the moment for someone who has asked for less motion", () => {
		expect.hasAssertions();

		const store = renderMoment(true);
		act(() => {
			store.set(visaMomentAtom, { id: 1, ids: ["milestone:1"] });
		});

		expect(store.get(visaMomentAtom)).toBeNull();
	}, 5000);
});
