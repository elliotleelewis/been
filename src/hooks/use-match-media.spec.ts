import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { mockMediaQueryList } from "../utils/test";
import { useMatchMedia } from "./use-match-media";

describe("useMatchMedia", () => {
	let mockMatchMedia: MockInstance<typeof window.matchMedia>;
	beforeEach(() => {
		mockMatchMedia = vi.spyOn(window, "matchMedia").mockReturnValue(mockMediaQueryList());
	});

	it("should initialise", () => {
		const { result } = renderHook(() => useMatchMedia("(max-width: 1024px)"));

		expect(result.current).toBeFalsy();
		expect(mockMatchMedia).toHaveBeenCalledOnce();
	}, 5000);
});
