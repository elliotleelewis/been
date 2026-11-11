import { render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { mockMediaQueryList } from "../core/test.ts";
import { loadMaplibreStyles } from "../globe/test.ts";
import { App } from "./app.tsx";

describe("app", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	it("should render", async () => {
		expect.hasAssertions();
		const store = createStore();
		await loadMaplibreStyles(store);

		const result = render(
			<Provider store={store}>
				<InRouter>
					<App />
				</InRouter>
			</Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
