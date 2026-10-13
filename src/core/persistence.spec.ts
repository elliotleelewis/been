import { createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { persistStorageAtom, storagePersistedAtom } from "./persistence.ts";
import { visitsAtom } from "./selection.ts";

describe("persistStorageAtom", () => {
	afterEach(() => {
		globalThis.localStorage.clear();
	});

	it("should read whether storage is already kept without asking for it", async () => {
		expect.hasAssertions();

		vi.spyOn(globalThis.navigator.storage, "persisted").mockResolvedValue(true);
		const persist = vi.spyOn(globalThis.navigator.storage, "persist").mockResolvedValue(true);
		const store = createStore();

		await expect(store.get(storagePersistedAtom)).resolves.toBeTruthy();
		expect(persist).not.toHaveBeenCalled();
	}, 5000);

	it("should settle on the browser's answer", async () => {
		expect.hasAssertions();

		vi.spyOn(globalThis.navigator.storage, "persist").mockResolvedValue(true);
		const store = createStore();

		store.set(persistStorageAtom);

		await expect(store.get(storagePersistedAtom)).resolves.toBeTruthy();
	}, 5000);

	it("should only ask the browser once a session", async () => {
		expect.hasAssertions();

		const persist = vi.spyOn(globalThis.navigator.storage, "persist").mockResolvedValue(false);
		const store = createStore();

		store.set(persistStorageAtom);
		await store.get(storagePersistedAtom);
		store.set(persistStorageAtom);

		expect(persist).toHaveBeenCalledOnce();
	}, 5000);

	it("should settle on no where the browser cannot keep storage", async () => {
		expect.hasAssertions();

		vi.spyOn(globalThis.navigator.storage, "persist").mockRejectedValue(
			new TypeError("Not supported"),
		);
		const store = createStore();

		store.set(persistStorageAtom);

		await expect(store.get(storagePersistedAtom)).resolves.toBeFalsy();
	}, 5000);

	it("should be asked for once the reader's visits are written", () => {
		expect.hasAssertions();

		const persist = vi.spyOn(globalThis.navigator.storage, "persist").mockResolvedValue(true);
		const store = createStore();

		store.set(visitsAtom, { FR: { at: "2026-10-13" } });

		expect(persist).toHaveBeenCalledOnce();
	}, 5000);
});
