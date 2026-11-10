import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_KEYS, forgetRetiredStorage, validatedStorage } from "./storage.ts";

const isNumber = (value: unknown): value is number => typeof value === "number";

describe("validatedStorage", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should read back a value in the expected shape", () => {
		expect.hasAssertions();

		const storage = validatedStorage(isNumber);
		storage.setItem("TEST", 42);

		expect(storage.getItem("TEST", 0)).toBe(42);
	}, 5000);

	it("should clear a value in any other shape", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem("TEST", JSON.stringify("forty-two"));
		const storage = validatedStorage(isNumber);

		expect(storage.getItem("TEST", 0)).toBe(0);
		expect(globalThis.localStorage.getItem("TEST")).toBeNull();
	}, 5000);

	it("should clear a value that is not JSON", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem("TEST", "{");
		const storage = validatedStorage(isNumber);

		expect(storage.getItem("TEST", 0)).toBe(0);
		expect(globalThis.localStorage.getItem("TEST")).toBeNull();
	}, 5000);
});

describe("forgetRetiredStorage", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should clear the drawer's size the app once kept, and nothing it keeps now", () => {
		expect.hasAssertions();

		globalThis.localStorage.setItem("APP_MENU_SIZE", JSON.stringify({ height: 0.5, width: 0.5 }));
		globalThis.localStorage.setItem(STORAGE_KEYS.countries, JSON.stringify({ FR: {} }));
		forgetRetiredStorage();

		expect(globalThis.localStorage.getItem("APP_MENU_SIZE")).toBeNull();
		expect(globalThis.localStorage.getItem(STORAGE_KEYS.countries)).not.toBeNull();
	}, 5000);
});
