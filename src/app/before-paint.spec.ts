import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_KEYS } from "../core/storage.ts";
import { BEFORE_PAINT_SCRIPT } from "./before-paint.ts";

/** Runs the script as the page's head does, as an inline script element. */
const runScript = (): void => {
	const script = globalThis.document.createElement("script");
	script.textContent = BEFORE_PAINT_SCRIPT;
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

describe("before paint script", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
		globalThis.document.documentElement.removeAttribute("style");
		delete globalThis.document.documentElement.dataset["sharedMap"];
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
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

	it("should mark the page when it opened on a share link, and only then", () => {
		expect.hasAssertions();

		runScript();

		expect(globalThis.document.documentElement).not.toHaveAttribute("data-shared-map");

		globalThis.history.replaceState(null, "", "#share=1.abc.AAAA");
		runScript();

		expect(globalThis.document.documentElement).toHaveAttribute("data-shared-map");
	}, 5000);
});
