import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockMediaQueryList } from "../utils/test";
import { useMatchMedia } from "./use-match-media";

describe("useMatchMedia", () => {
	it("should initialise", () => {
		expect.hasAssertions();

		const mockMatchMedia = vi.spyOn(globalThis, "matchMedia").mockReturnValue(mockMediaQueryList());

		const { result } = renderHook(() => useMatchMedia("(max-width: 1024px)"));

		expect(result.current).toBeFalsy();
		expect(mockMatchMedia).toHaveBeenCalledOnce();
	}, 5000);
});
