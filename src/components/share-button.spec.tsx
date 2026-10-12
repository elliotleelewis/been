import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { countries } from "../data/countries";
import type { Visits } from "../models/country";
import { visitsAtom } from "../state/atoms";
import { rawCountriesAtom } from "../state/dataset";
import { decodeShare, shareValueOf } from "../utils/share";
import { ShareButton } from "./share-button";

/** The order share links mark countries in, as the app derives it. */
const CODES = countries.map(({ iso3166 }) => iso3166).toSorted();

const renderButton = (): ReturnType<typeof render> => {
	const store = createStore();
	store.set(
		rawCountriesAtom,
		Object.fromEntries(
			CODES.map((code) => [code, { iso3166: code, region: "150", subregion: "155" } as const]),
		),
	);
	store.set(visitsAtom, { FR: {}, IT: {} });
	return render(
		<Provider store={store}>
			<ShareButton />
		</Provider>,
	);
};

const openDialog = (result: ReturnType<typeof render>): HTMLElement => {
	act(() => {
		result.getByRole("button", { name: "Share your map" }).click();
	});
	return result.getByRole("dialog", { name: "Share your map" });
};

/** The link in the dialog's text box. */
const linkIn = (result: ReturnType<typeof render>): string =>
	result.getByRole("textbox", { name: "Link to your map" }).getAttribute("value") ?? "";

/** The map the link in the dialog's text box carries. */
const sharedVisitsIn = (result: ReturnType<typeof render>): Visits | undefined => {
	const value = shareValueOf(new globalThis.URL(linkIn(result)).hash);
	return value === undefined ? undefined : decodeShare(value, CODES);
};

describe("share button", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should open a dialog with a link to the reader's map, and a QR code for it", async () => {
		expect.hasAssertions();

		const result = renderButton();
		const dialog = openDialog(result);

		expect(dialog).toHaveTextContent("Anyone with the link sees your 2 countries");
		expect(sharedVisitsIn(result)).toStrictEqual({ FR: {}, IT: {} });
		const qrCode = await result.findByRole("img", { name: "QR code for the link to your map" });

		expect(qrCode).toBeInTheDocument();
	}, 5000);

	it("should copy the link", async () => {
		expect.hasAssertions();

		const writeText = vi.spyOn(globalThis.navigator.clipboard, "writeText").mockResolvedValue();
		const result = renderButton();
		openDialog(result);
		act(() => {
			result.getByRole("button", { name: "Copy link" }).click();
		});

		const copied = await result.findByRole("button", { name: "Copied!" });

		expect(copied).toBeInTheDocument();
		expect(writeText).toHaveBeenCalledWith(linkIn(result));
	}, 5000);

	it("should close when done", () => {
		expect.hasAssertions();

		const result = renderButton();
		openDialog(result);
		act(() => {
			result.getByRole("button", { name: "Done" }).click();
		});

		expect(result.queryByRole("dialog")).toBeNull();
	}, 5000);
});
