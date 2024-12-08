import type { WritableAtom } from 'jotai/index';
import { useHydrateAtoms } from 'jotai/utils';
import type { PropsWithChildren } from 'react';

type AnyWritableAtom = WritableAtom<unknown, never[], unknown>;
type InferAtomTuples<T> = {
	[K in keyof T]: T[K] extends readonly [infer A, unknown]
		? A extends WritableAtom<unknown, infer Args, infer _Result>
			? readonly [A, Args[0]]
			: T[K]
		: never;
};

export const HydrateAtoms = <
	T extends (readonly [AnyWritableAtom, unknown])[],
>({
	initialValues,
	children,
}: PropsWithChildren<{
	initialValues: InferAtomTuples<T>;
}>) => {
	useHydrateAtoms(initialValues);
	return children;
};
