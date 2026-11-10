import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_KEYS } from "../core/storage.ts";
import { MENU_SIZE_SCRIPT } from "./menu-size.ts";

/** Runs the script as the page's head does, as an inline script element. */
const runScript = (): void => {
	const script = globalThis.document.createElement("script");
	script.textContent = MENU_SIZE_SCRIPT;
	globalThis.document.head.append(script);
	script.remove();
};

/** The drawer's size the script set on the page, axis by axis. */
const sizeSet = (): Readonly<Record<"height" | "width", string>> => {
	const { style } = globalThis.document.documentElement;
	return {
		height: style.getPropertyValue("--menu-height"),
		width: style.getPropertyValue("--menu-width"),
	};
};

describe("menu size script", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
		globalThis.document.documentElement.removeAttribute("style");
	});

	it("should size the drawer as the reader left it, rounded as the app rounds it", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem(
			STORAGE_KEYS.menuSize,
			JSON.stringify({ height: 0.55, width: 0.45 }),
		);
		runScript();

		expect(sizeSet()).toStrictEqual({ height: "55%", width: "45%" });
	}, 5000);

	it("should fall back to the default size with nothing stored", () => {
		expect.hasAssertions();

		runScript();

		expect(sizeSet()).toStrictEqual({ height: "40%", width: "33.33%" });
	}, 5000);

	it("should fall back to the default size for anything stored it cannot read", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem(STORAGE_KEYS.menuSize, "{not json");
		runScript();

		expect(sizeSet()).toStrictEqual({ height: "40%", width: "33.33%" });

		globalThis.localStorage.setItem(STORAGE_KEYS.menuSize, JSON.stringify({ width: "wide" }));
		runScript();

		expect(sizeSet()).toStrictEqual({ height: "40%", width: "33.33%" });
	}, 5000);
});
