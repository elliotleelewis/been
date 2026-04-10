import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { useMatchMedia } from "./use-match-media";

describe("useMatchMedia", () => {
	let mockMatchMedia: MockInstance<typeof window.matchMedia>;
	beforeEach(() => {
		mockMatchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({
			addEventListener: vi.fn<MediaQueryList["addEventListener"]>(),
			matches: false,
			removeEventListener: vi.fn<MediaQueryList["removeEventListener"]>(),
		} satisfies Partial<MediaQueryList> as unknown as MediaQueryList);
	});

	it("should initialise", () => {
		const { result } = renderHook(() =>
			useMatchMedia("(max-width: 1024px)"),
		);

		expect(result.current).toBeFalsy();
		expect(mockMatchMedia).toHaveBeenCalledTimes(2);
	});
});
