import { cleanup, fireEvent, render } from "@testing-library/react";
import { Provider } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockMediaQueryList } from "../utils/test.ts";
import { MenuResizer } from "./menu-resizer";

const renderResizer = (): ReturnType<typeof render> =>
	render(
		<Provider>
			<MenuResizer controls="menu" />
		</Provider>,
	);

const valueOf = (separator: HTMLElement): number => Number(separator.getAttribute("aria-valuenow"));

describe("menuResizer", () => {
	beforeEach(() => {
		globalThis.localStorage.clear();
		// A narrow viewport, where the drawer is a sheet and the handle drags it up and down.
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	// Auto-cleanup is not registered as the suite does not run with `globals`.
	afterEach(() => {
		cleanup();
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = renderResizer();

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);

	it("should grow the drawer when the handle is moved away from the globe", () => {
		expect.hasAssertions();

		const result = renderResizer();
		const separator = result.getByRole("separator");
		const before = valueOf(separator);

		fireEvent.keyDown(separator, { key: "ArrowUp" });

		expect(valueOf(separator)).toBeGreaterThan(before);
	}, 5000);

	it("should shrink the drawer when the handle is moved towards the globe", () => {
		expect.hasAssertions();

		const result = renderResizer();
		const separator = result.getByRole("separator");
		const before = valueOf(separator);

		fireEvent.keyDown(separator, { key: "ArrowDown" });

		expect(valueOf(separator)).toBeLessThan(before);
	}, 5000);

	it("should not shrink the drawer past its lower bound", () => {
		expect.hasAssertions();

		const result = renderResizer();
		const separator = result.getByRole("separator");

		for (let press = 0; press < 100; press += 1) {
			fireEvent.keyDown(separator, { key: "ArrowDown" });
		}

		expect(valueOf(separator)).toBe(Number(separator.getAttribute("aria-valuemin")));
	}, 5000);
});
