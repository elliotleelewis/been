import type { WritableAtom } from 'jotai/index';
import { useHydrateAtoms } from 'jotai/utils';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: Any is required to allow any atom type. Unfortunately cannot be `unknown`.
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

export const HydrateAtoms = <
	T extends readonly (readonly [AnyWritableAtom, ...unknown[]])[],
>({
	initialValues,
	children,
}: PropsWithChildren<{
	initialValues: InferAtomTuples<T>;
}>) => {
	useHydrateAtoms(initialValues);
	return children;
};
