import { useCallback, useEffect, useMemo, useState } from "react";

import { m } from "../paraglide/messages.js";

/** How long the copy button says it has copied, before going back to offering to. */
const COPIED_DURATION_MS = 2000;

export interface ShareLinkActions {
	/** Copies the link to the clipboard. */
	readonly copy: () => void;
	/** Whether the link has just been copied. */
	readonly copied: boolean;
	/** Hands the link to the device's own share sheet, where it has one, as phones do. */
	readonly share: (() => void) | undefined;
}

/** What can be done with a share link: the clipboard everywhere, and a share sheet where there is one. */
export const useShareLink = (url: string): ShareLinkActions => {
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
			.writeText(url)
			.then(() => {
				setCopied(true);
			})
			.catch((cause: unknown) => {
				console.error("Failed to copy the share link.", cause);
			});
	}, [url]);

	const canShare = typeof globalThis.navigator.share === "function";
	const share = useCallback(() => {
		globalThis.navigator.share({ title: m.share_native_title(), url }).catch((cause: unknown) => {
			// Closing the share sheet without picking anything rejects too, and is no failure.
			if (!(cause instanceof globalThis.DOMException && cause.name === "AbortError")) {
				console.error("Failed to share the link.", cause);
			}
		});
	}, [url]);

	return useMemo(
		() => ({ copied, copy, share: canShare ? share : undefined }),
		[canShare, copied, copy, share],
	);
};
