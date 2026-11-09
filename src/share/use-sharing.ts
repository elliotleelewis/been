import { useCallback, useEffect, useMemo, useState } from "react";

/** How long a copy button says it has copied, before going back to offering to. */
const COPIED_DURATION_MS = 2000;

/** What can be done with something to share. */
export interface Sharing {
	/** Copies it to the clipboard. */
	readonly copy: () => void;
	/** Whether it has just been copied. */
	readonly copied: boolean;
	/** Hands it to the device's own share sheet, where it has one, as phones do. */
	readonly share: (() => void) | undefined;
}

/**
 * What can be done with something to share: `text` to the clipboard everywhere, and `data` to a
 * share sheet where there is one.
 */
export const useSharing = (text: string, data: ShareData): Sharing => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const timeout = copied
			? globalThis.setTimeout(() => {
					setCopied(false);
				}, COPIED_DURATION_MS)
			: undefined;
		return (): void => {
			globalThis.clearTimeout(timeout);
		};
	}, [copied]);

	const copy = useCallback(() => {
		globalThis.navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopied(true);
			})
			.catch((cause: unknown) => {
				console.error("Failed to copy.", cause);
			});
	}, [text]);

	const canShare = typeof globalThis.navigator.share === "function";
	const share = useCallback(() => {
		globalThis.navigator.share(data).catch((cause: unknown) => {
			// Closing the share sheet without picking anything rejects too, and is no failure.
			if (!(cause instanceof globalThis.DOMException && cause.name === "AbortError")) {
				console.error("Failed to share.", cause);
			}
		});
	}, [data]);

	return useMemo(
		() => ({ copied, copy, share: canShare ? share : undefined }),
		[canShare, copied, copy, share],
	);
};
