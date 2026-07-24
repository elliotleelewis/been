import type { PropsWithChildren, ReactNode } from "react";
import type { WritableAtom } from "jotai/index";
import { useHydrateAtoms } from "jotai/utils";
import { vi } from "vitest";

// oxlint-disable-next-line no-explicit-any -- Any is required to allow any atom type. Unfortunately cannot be `unknown`.
type AnyWritableAtom = WritableAtom<unknown, any[], unknown>;

type InferAtomTuples<T> = {
	[K in keyof T]: T[K] extends readonly [infer A, ...infer Rest]
		? A extends WritableAtom<unknown, infer Args extends unknown[], unknown>
			? Rest extends Args
				? readonly [A, ...Rest]
				: never
			: never
		: never;
};

// oxlint-disable-next-line no-export -- This is a test utility file.
export const HydrateAtoms = <T extends readonly (readonly [AnyWritableAtom, ...unknown[]])[]>({
	initialValues,
	children,
}: PropsWithChildren<{
	initialValues: InferAtomTuples<T>;
}>): ReactNode => {
	useHydrateAtoms(initialValues);
	return children;
};

// oxlint-disable-next-line no-export -- This is a test utility file.
export const mockMediaQueryList = (matches = false): MediaQueryList => ({
	addEventListener: vi.fn<MediaQueryList["addEventListener"]>(),
	// oxlint-disable-next-line no-deprecated -- Deprecated, but still required by the `MediaQueryList` type.
	addListener: vi.fn<MediaQueryList["addListener"]>(),
	dispatchEvent: vi.fn<MediaQueryList["dispatchEvent"]>(),
	matches,
	media: "",
	onchange: null,
	removeEventListener: vi.fn<MediaQueryList["removeEventListener"]>(),
	// oxlint-disable-next-line no-deprecated -- Deprecated, but still required by the `MediaQueryList` type.
	removeListener: vi.fn<MediaQueryList["removeListener"]>(),
});

// oxlint-disable-next-line no-export -- This is a test utility file.
export const assertDefined = <T>(value: T | null | undefined, message: string): T => {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
	return value;
};
