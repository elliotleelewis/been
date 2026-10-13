import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { mockMediaQueryList } from "../core/test.ts";
import { announceStampAtom, stampMomentAtom } from "../core/ticking.ts";
import { StampMoment } from "./stamp-moment.tsx";

/** Renders the stamp moment, as someone who has, or has not, asked for less motion. */
const renderMoment = (reducedMotion: boolean): ReturnType<typeof createStore> => {
	vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList(reducedMotion));
	const store = createStore();
	store.set(rawCountriesAtom, { FR: { iso3166: "FR", region: "150", subregion: "155" } });
	store.set(visitsAtom, { FR: { at: "2026-10-13" } });
	render(
		<Provider store={store}>
			<StampMoment target={createRef<HTMLElement>()} />
		</Provider>,
	);
	return store;
};

describe("stamp moment", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		globalThis.localStorage.clear();
	});

	it("should press the stamp onto the screen, then let it go once it has landed", async () => {
		expect.hasAssertions();

		const store = renderMoment(false);
		act(() => {
			store.set(announceStampAtom, "FR");
		});

		expect(globalThis.document.querySelector("[aria-hidden='true'] svg")).not.toBeNull();

		// Played out to the end at once, rather than waited for, as a busy browser runs them slow.
		for (const animation of globalThis.document.getAnimations()) {
			animation.finish();
		}
		await vi.waitFor(() => {
			expect(store.get(stampMomentAtom)).toBeNull();
		});
	}, 5000);

	it("should skip the moment for someone who has asked for less motion", () => {
		expect.hasAssertions();

		const store = renderMoment(true);
		act(() => {
			store.set(announceStampAtom, "FR");
		});

		expect(store.get(stampMomentAtom)).toBeNull();
	}, 5000);
});
