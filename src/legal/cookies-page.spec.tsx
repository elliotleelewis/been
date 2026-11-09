import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { STORAGE_KEYS } from "../core/storage.ts";
import { CookiesPage } from "./cookies-page.tsx";
import { STORED_THINGS } from "./types.ts";

/** Renders the cookies page in a store of its own. */
const renderPage = (): ReturnType<typeof render> =>
	render(
		<Provider store={createStore()}>
			<InRouter>
				<CookiesPage />
			</InRouter>
		</Provider>,
	);

/** Renders the page over a map, and something another site on the origin stored, for its button. */
const renderStored = (): HTMLElement => {
	globalThis.localStorage.setItem(STORAGE_KEYS.countries, JSON.stringify({ FR: {} }));
	globalThis.localStorage.setItem("SOMEONE_ELSE", "1");
	return renderPage().getByRole("button", { name: "Clear your map and settings" });
};

/** Taps a button. */
const tap = (button: HTMLElement): void => {
	act(() => {
		button.click();
	});
};

describe("cookies page", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should say what every key the app stores is", () => {
		expect.hasAssertions();

		const result = renderPage();

		expect(STORED_THINGS.map(({ key }) => key).toSorted()).toStrictEqual(
			Object.values(STORAGE_KEYS).toSorted(),
		);
		for (const key of Object.values(STORAGE_KEYS)) {
			expect(result.getByText(key)).toBeInTheDocument();
		}
	}, 5000);

	it("should only ask to be sure on the first tap, as clearing deletes the map", () => {
		expect.hasAssertions();

		const button = renderStored();
		tap(button);

		expect(button).toHaveAccessibleName("Tap again to delete your map");
		expect(globalThis.localStorage.getItem(STORAGE_KEYS.countries)).not.toBeNull();
	}, 5000);

	it("should clear the map and settings on the second tap, and leave anything else", () => {
		expect.hasAssertions();

		const button = renderStored();
		tap(button);
		tap(button);

		expect(globalThis.localStorage.getItem(STORAGE_KEYS.countries)).toBeNull();
		expect(globalThis.localStorage.getItem("SOMEONE_ELSE")).toBe("1");
		expect(button).toBeDisabled();
		expect(button.parentElement).toHaveTextContent("Cleared. Your map starts afresh.");
	}, 5000);

	it("should have nothing to clear on a device the app has stored nothing on", () => {
		expect.hasAssertions();

		const result = renderPage();

		expect(result.getByRole("button", { name: "Clear your map and settings" })).toBeDisabled();
		expect(result.getByText("There’s nothing to clear.")).toBeInTheDocument();
	}, 5000);
});
