import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "./progress.tsx";

describe("progress", () => {
	it("should render", () => {
		expect.hasAssertions();

		const result = render(<Progress complete={0} />);

		expect(result.asFragment()).toMatchSnapshot();
	}, 5000);
});
