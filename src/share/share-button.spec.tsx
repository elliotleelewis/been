import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { rawCountriesAtom } from "../core/dataset.ts";
import { InRouter } from "../core/in-router.tsx";
import { visitsAtom } from "../core/selection.ts";
import { openSharedMap, visitsInLink } from "../core/test.ts";
import type { Visits } from "../core/types.ts";
import { countries } from "../data/countries.ts";
import { ShareButton } from "./share-button.tsx";

/** The order share links mark countries in, as the app derives it. */
const CODES = countries.map(({ iso3166 }) => iso3166).toSorted();

/** A map with two countries ticked. */
const FRANCE_AND_ITALY: Visits = { FR: {}, IT: {} };

/** Renders the share button on the reader's map of `visits`, or on a shared map of `shared`. */
const renderButton = (visits: Visits, shared?: Visits): ReturnType<typeof render> => {
	const store = createStore();
	store.set(
		rawCountriesAtom,
		Object.fromEntries(
			CODES.map((code) => [code, { iso3166: code, region: "150", subregion: "155" } as const]),
		),
	);
	store.set(visitsAtom, visits);
	if (shared !== undefined) {
		openSharedMap(store, shared);
	}
	return render(
		<Provider store={store}>
			<InRouter>
				<ShareButton />
			</InRouter>
		</Provider>,
	);
};

const openDialog = (result: ReturnType<typeof render>): HTMLElement => {
	act(() => {
		result.getByRole("button", { name: "Share your map" }).click();
	});
	return result.getByRole("dialog", { name: "Share your map" });
};

/** The summary in the dialog, to copy or send. */
const summaryIn = (result: ReturnType<typeof render>): string =>
	result.getByRole("status", { name: "Your map, summed up in emoji" }).textContent;

/** The link the summary in the dialog ends with. */
const linkIn = (result: ReturnType<typeof render>): string =>
	summaryIn(result).split("\n").at(-1) ?? "";

/** The map the link in the dialog carries. */
const sharedVisitsIn = (result: ReturnType<typeof render>): Visits | undefined =>
	visitsInLink(linkIn(result), CODES);

describe("share button", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should open a dialog with a link to the reader's map, and a QR code for it", async () => {
		expect.hasAssertions();

		const result = renderButton(FRANCE_AND_ITALY);
		const dialog = openDialog(result);

		expect(dialog).toHaveTextContent("Anyone with the link sees your 2 countries");
		expect(sharedVisitsIn(result)).toStrictEqual({ FR: {}, IT: {} });
		expect(new globalThis.URL(linkIn(result)).pathname).toBe("/");
		const qrCode = await result.findByRole("img", { name: "QR code for the link to your map" });

		expect(qrCode).toBeInTheDocument();
	}, 5000);

	it("should copy the summary, link and all", async () => {
		expect.hasAssertions();

		const writeText = vi.spyOn(globalThis.navigator.clipboard, "writeText").mockResolvedValue();
		const result = renderButton(FRANCE_AND_ITALY);
		openDialog(result);
		act(() => {
			result.getByRole("button", { name: "Copy" }).click();
		});

		const copied = await result.findByRole("button", { name: "Copied!" });

		expect(copied).toBeInTheDocument();
		expect(writeText).toHaveBeenCalledWith(summaryIn(result));
		expect(summaryIn(result)).toContain("been · 2/");
	}, 5000);

	it("should close from its close button", () => {
		expect.hasAssertions();

		const result = renderButton(FRANCE_AND_ITALY);
		openDialog(result);
		act(() => {
			result.getByRole("button", { name: "Close" }).click();
		});

		expect(result.queryByRole("dialog")).toBeNull();
	}, 5000);

	it("should say how to start a map, not share an empty one, while nothing is ticked", () => {
		expect.hasAssertions();

		const result = renderButton({});
		const dialog = openDialog(result);

		expect(dialog).toHaveTextContent("Tick the countries you've been to");
		expect(result.queryByRole("status", { name: "Your map, summed up in emoji" })).toBeNull();
		expect(result.queryByRole("button", { name: "Copy" })).toBeNull();
	}, 5000);

	it("should say one country, not one countries", () => {
		expect.hasAssertions();

		const result = renderButton({ FR: {} });

		expect(openDialog(result)).toHaveTextContent("Anyone with the link sees your 1 country,");
	}, 5000);

	it("should be there on a shared map only once the reader has one of their own", () => {
		expect.hasAssertions();

		expect(
			renderButton({}, FRANCE_AND_ITALY).queryByRole("button", { name: "Share your map" }),
		).toBeNull();
	}, 5000);

	it("should reply to a shared map with the reader's own, saying how the two compare", () => {
		expect.hasAssertions();

		const result = renderButton({ FR: {}, JP: {} }, FRANCE_AND_ITALY);
		openDialog(result);

		expect(summaryIn(result)).toContain("🆚 Yours and mine: 🤝 1 in common · ✈️ 1 new to you");
		expect(summaryIn(result)).toContain("Open it to see how we compare.");
		expect(sharedVisitsIn(result)).toStrictEqual({ FR: {}, JP: {} });
	}, 5000);
});
