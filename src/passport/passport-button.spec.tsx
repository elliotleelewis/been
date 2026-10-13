import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { localesAtom } from "../core/countries.ts";
import { rawCountriesAtom } from "../core/dataset.ts";
import { focusAtom, visitsAtom } from "../core/selection.ts";
import { PassportButton } from "./passport-button.tsx";

interface Rendered {
	readonly result: ReturnType<typeof render>;
	readonly store: ReturnType<typeof createStore>;
}

const renderButton = (): Rendered => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		JP: { iso3166: "JP", region: "142", subregion: "030" },
	});
	store.set(visitsAtom, { FR: { at: "2026-10-13" } });
	const result = render(
		<Provider store={store}>
			<PassportButton />
		</Provider>,
	);
	return { result, store };
};

/** Opens the passport, and then its cover, onto the identity page. */
const openToIdentityPage = ({ result }: Rendered): HTMLElement => {
	act(() => {
		result.getByRole("button", { name: "Open your passport" }).click();
	});
	act(() => {
		result.getByRole("button", { name: "Open the passport" }).click();
	});
	return result.getByRole("dialog", { name: "Passport" });
};

/** Turns the open passport's pages forward with the arrow key, `times` over. */
const turnForward = (dialog: HTMLElement, times: number): void => {
	for (let turn = 0; turn < times; turn += 1) {
		fireEvent.keyDown(dialog, { key: "ArrowRight" });
	}
};

describe("passport button", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should open at the cover, and then at the identity page", () => {
		expect.hasAssertions();

		const rendered = renderButton();
		const dialog = openToIdentityPage(rendered);

		expect(dialog).toHaveTextContent("1 of 2");
		expect(dialog).toHaveTextContent("13 OCT 2026");
		expect(dialog).toHaveTextContent("Identity");
	}, 5000);

	it("should turn to the visas the map has earned, and say what each is for", () => {
		expect.hasAssertions();

		const rendered = renderButton();
		const dialog = openToIdentityPage(rendered);
		turnForward(dialog, 1);

		expect(dialog).toHaveTextContent("Visas 1 of 2");
		expect(dialog).toHaveTextContent(
			"First stamp visa: The first country in the passport, issued 13 OCT 2026",
		);
		expect(
			rendered.result.container.ownerDocument.querySelector("svg[viewBox='0 0 300 190']"),
		).toMatchSnapshot();
	}, 5000);

	it("should turn to the stamps with the arrow keys, and show a stamp's country", () => {
		expect.hasAssertions();

		const rendered = renderButton();
		const dialog = openToIdentityPage(rendered);
		// The cover and identity page are followed by two pages of visas, for France's three.
		turnForward(dialog, 3);
		const stamp = rendered.result.getByRole("button", {
			name: "France, 13 OCT 2026. Show on the globe",
		});

		expect(
			rendered.result.container.ownerDocument.querySelector("svg[viewBox='0 0 120 120']"),
		).toMatchSnapshot();

		act(() => {
			stamp.click();
		});

		expect(rendered.result.queryByRole("dialog")).toBeNull();
		expect(rendered.store.get(focusAtom)?.type).toBe("country");
	}, 5000);
});
