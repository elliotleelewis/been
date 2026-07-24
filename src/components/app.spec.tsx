import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { mockMediaQueryList } from "@/utils/test";
import { App } from "./app";

describe("app", () => {
	beforeAll(() => {
		vi.spyOn(window, "matchMedia").mockImplementation(() => mockMediaQueryList());
	});

	it("should render", () => {
		const result = render(<App />);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
