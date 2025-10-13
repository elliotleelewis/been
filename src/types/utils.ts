// oxlint-disable-next-line no-explicit-any -- Generic extends requires any
export type ForwardedRefFunction<T extends (...args: any[]) => any> = (
	...params: Parameters<T>
) => ReturnType<T> | undefined;
