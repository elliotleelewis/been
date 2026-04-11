import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { App } from "./app";

describe("app", () => {
	beforeAll(() => {
		vi.spyOn(window, "matchMedia").mockImplementation(
			() =>
				({
					addEventListener:
						vi.fn<MediaQueryList["addEventListener"]>(),
					matches: false,
					removeEventListener:
						vi.fn<MediaQueryList["removeEventListener"]>(),
				}) satisfies Partial<MediaQueryList> as unknown as MediaQueryList,
		);
	});

	it("should render", () => {
		const result = render(<App />);

		expect(result.asFragment()).toMatchSnapshot();
	});
});
