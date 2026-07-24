export const useWindow = (): Window & typeof globalThis => {
	return window;
};
