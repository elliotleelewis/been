import { afterEach, describe, expect, it } from "vitest";

import { BEFORE_PAINT_SCRIPT } from "./before-paint.ts";

/** Runs the script as the page's head does, as an inline script element. */
const runScript = (): void => {
	const script = globalThis.document.createElement("script");
	script.textContent = BEFORE_PAINT_SCRIPT;
	globalThis.document.head.append(script);
	script.remove();
};

describe("before paint script", () => {
	afterEach(() => {
		delete globalThis.document.documentElement.dataset["sharedMap"];
		globalThis.history.replaceState(null, "", globalThis.location.pathname);
	});

	it("should mark the page when it opened on a share link, and only then", () => {
		expect.hasAssertions();

		runScript();

		expect(globalThis.document.documentElement).not.toHaveAttribute("data-shared-map");

		globalThis.history.replaceState(null, "", "#share=1.abc.AAAA");
		runScript();

		expect(globalThis.document.documentElement).toHaveAttribute("data-shared-map");
	}, 5000);
});
