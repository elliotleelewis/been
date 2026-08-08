import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockMediaQueryList } from "../utils/test";
import { App } from "./app";

describe("app", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = render(<App />);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
