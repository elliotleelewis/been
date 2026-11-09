import { render } from "@testing-library/react";
import { Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InRouter } from "../core/in-router.tsx";
import { HydrateAtoms, mockMediaQueryList } from "../core/test.ts";
import { menuSizeAtom } from "../menu/size.ts";
import { MENU_SIZE_DEFAULT } from "../menu/types.ts";
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
					{/* The drawer's size is read out of local storage when the atom is created, which is
				before any of this runs and cannot be undone by clearing storage here. The size the
				snapshot is taken at is set rather than left to whatever another spec file stored. */}
					<HydrateAtoms initialValues={[[menuSizeAtom, MENU_SIZE_DEFAULT]]}>
						<App />
					</HydrateAtoms>
				</InRouter>
			</Provider>,
		);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
