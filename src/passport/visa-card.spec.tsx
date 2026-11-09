import { act, cleanup, render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

import { localesAtom } from "../core/countries.ts";
import { rawCountriesAtom } from "../core/dataset.ts";
import { visitsAtom } from "../core/selection.ts";
import { assertDefined } from "../core/test.ts";
import { turnPassportPageAtom } from "./pages.ts";
import { PassportVisaPage } from "./passport-visa-page.tsx";
import { flippedVisaAtom } from "./visa-backs.ts";

interface Rendered {
	readonly result: ReturnType<typeof render>;
	readonly store: ReturnType<typeof createStore>;
}

/** Renders the first page of visas for a map of France and Monaco, ticked on two days. */
const renderPage = (): Rendered => {
	const store = createStore();
	store.set(localesAtom, ["en-GB"]);
	store.set(rawCountriesAtom, {
		FR: { iso3166: "FR", region: "150", subregion: "155" },
		JP: { iso3166: "JP", region: "142", subregion: "030" },
		MC: { iso3166: "MC", region: "150", subregion: "155" },
	});
	store.set(visitsAtom, { FR: { at: "2026-10-13" }, MC: { at: "2026-10-15" } });
	const result = render(
		<Provider store={store}>
			<PassportVisaPage index={0} />
		</Provider>,
	);
	return { result, store };
};

/** The button on the front of the visa for `title`. */
const frontOf = ({ result }: Rendered, title: RegExp): HTMLElement =>
	result.getByRole("button", { name: title });

/** The back of the visa whose front is `front`. */
const backOf = (front: HTMLElement): HTMLElement => {
	const id = String(front.getAttribute("aria-controls"));
	return assertDefined(
		globalThis.document.querySelector<HTMLElement>(`[id="${id}"]`),
		"The visa has no back.",
	);
};

/** The button on the back of the visa for `title` that turns it back over. */
const flipBackOf = ({ result }: Rendered, title: string): HTMLElement =>
	result.getByRole("button", { name: `Turn the ${title} visa back over` });

/** Taps one side of a visa, turning it over. */
const turnOver = (side: HTMLElement): void => {
	act(() => {
		side.click();
	});
};

describe("visa card", () => {
	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
		globalThis.localStorage.clear();
	});

	it("should turn over to show the countries that earned it", () => {
		expect.hasAssertions();

		const rendered = renderPage();
		const front = frontOf(rendered, /^Europe visa/u);
		turnOver(front);

		expect(front).toHaveAccessibleName(/\. A foil visa$/u);
		expect(front).toHaveAttribute("aria-expanded", "true");
		expect(backOf(front)).toHaveTextContent("The last one in Europe");
		expect(backOf(front)).toMatchSnapshot();
		expect(flipBackOf(rendered, "Europe")).toHaveFocus();
	}, 5000);

	it("should turn back over from the button on its back", () => {
		expect.hasAssertions();

		const rendered = renderPage();
		const front = frontOf(rendered, /^Europe visa/u);
		turnOver(front);
		turnOver(flipBackOf(rendered, "Europe"));

		expect(front).toHaveAttribute("aria-expanded", "false");
		expect(backOf(front)).toHaveAttribute("inert");
		expect(front).toHaveFocus();
	}, 5000);

	it("should turn one visa over at a time, leaving focus with the one turned", () => {
		expect.hasAssertions();

		const rendered = renderPage();
		const first = frontOf(rendered, /^First stamp visa/u);
		const second = frontOf(rendered, /^Europe visa/u);

		turnOver(first);
		turnOver(second);

		expect(first).toHaveAttribute("aria-expanded", "false");
		expect(second).toHaveAttribute("aria-expanded", "true");
		expect(flipBackOf(rendered, "Europe")).toHaveFocus();
	}, 5000);

	it("should turn a visa back over when the page turns", () => {
		expect.hasAssertions();

		const { store } = renderPage();
		store.set(flippedVisaAtom, "milestone:1");
		store.set(turnPassportPageAtom, 1);

		expect(store.get(flippedVisaAtom)).toBeNull();
	}, 5000);
});
