import type { PropsWithChildren, ReactNode } from "react";
import type { WritableAtom } from "jotai/index";
import { useHydrateAtoms } from "jotai/utils";

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
export const HydrateAtoms = <
	T extends readonly (readonly [AnyWritableAtom, ...unknown[]])[],
>({
	initialValues,
	children,
}: PropsWithChildren<{
	initialValues: InferAtomTuples<T>;
}>): ReactNode => {
	useHydrateAtoms(initialValues);
	return children;
};
