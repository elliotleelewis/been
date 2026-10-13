import { act, renderHook, waitFor } from "@testing-library/react";
import type { RenderHookResult } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { FC, ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { rawCountriesAtom } from "../state/dataset";
import { endStampMomentAtom, stampCountryAtom } from "../state/stamping";
import { useGlobeLayers } from "./use-globe-layers";
import type { GlobeLayers } from "./use-globe-layers";

const createTestStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		IT: { iso3166: "IT", region: "150", subregion: "039" },
	});
	return store;
};

const renderLayers = (
	store: ReturnType<typeof createStore>,
): RenderHookResult<GlobeLayers, unknown> => {
	const wrapper: FC<{ readonly children: ReactNode }> = ({ children }) => (
		<Provider store={store}>{children}</Provider>
	);
	return renderHook(() => useGlobeLayers(), { wrapper });
};

describe("useGlobeLayers", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should fill a country just ticked on the fresh layer, fading in", async () => {
		expect.hasAssertions();

		const store = createTestStore();
		const { result } = renderLayers(store);
		act(() => {
			store.set(stampCountryAtom, "FR");
		});

		expect(result.current.beenFilter).toStrictEqual(["in", ["get", "iso_3166_1"], ["literal", []]]);
		expect(result.current.freshFilter).toStrictEqual(["==", ["get", "iso_3166_1"], "FR"]);
		await waitFor(() => {
			expect(result.current.freshPaint["fill-opacity"]).toBe(0.6);
		});
	}, 5000);

	it("should hand a country back to the been layer once its moment is over", () => {
		expect.hasAssertions();

		const store = createTestStore();
		const { result } = renderLayers(store);
		act(() => {
			store.set(stampCountryAtom, "FR");
			store.set(endStampMomentAtom, 1);
		});

		expect(result.current.beenFilter).toStrictEqual([
			"in",
			["get", "iso_3166_1"],
			["literal", ["FR"]],
		]);
		expect(result.current.freshFilter).toStrictEqual(["==", ["get", "iso_3166_1"], ""]);
		expect(result.current.freshPaint["fill-opacity"]).toBe(0);
	}, 5000);
});
