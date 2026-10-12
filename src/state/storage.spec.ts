import { afterEach, describe, expect, it } from "vitest";

import { validatedStorage } from "./storage";

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
