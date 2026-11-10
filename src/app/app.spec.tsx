import { render } from "@testing-library/react";
import { Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { mockMediaQueryList } from "../core/test.ts";
import { App } from "./app.tsx";

describe("app", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	it("should render", () => {
		expect.hasAssertions();

		const result = render(
			<Provider>
				<InRouter>
					<App />
				</InRouter>
			</Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
