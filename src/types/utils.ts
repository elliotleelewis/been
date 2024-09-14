// biome-ignore lint/suspicious/noExplicitAny: Generic extends requires any
export type ForwardedRefFunction<T extends (...args: any[]) => any> = (
	...params: Parameters<T>
) => ReturnType<T> | undefined;
