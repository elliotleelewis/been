// oxlint-disable-next-line no-explicit-any -- Generic extends requires any
export type ForwardedRefFunction<Fn extends (...args: any[]) => any> = (
	...params: Parameters<Fn>
) => ReturnType<Fn> | undefined;
