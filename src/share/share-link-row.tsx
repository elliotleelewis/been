import { memo, useMemo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { ShareIcon } from "./share-icon.tsx";
import { useSharing } from "./use-sharing.ts";

interface Props {
	/** The link to share. */
	readonly url: string;
}

const ICON_BUTTON_CLASS_NAME =
	"grid size-9 shrink-0 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white";

/**
 * The link to the map, to select and copy by hand, with buttons at its end that copy it, or hand it
 * to the device's share sheet where there is one. The copy button turns to a tick once it has.
 */
export const ShareLinkRow: FC<Props> = memo(({ url }) => {
	const data = useMemo(() => ({ title: m.share_native_title(), url }), [url]);
	const { copied, copy, share } = useSharing(url, data);

	return (
		<div className="flex w-full items-center gap-1 rounded-lg border border-zinc-300 bg-zinc-50 p-1 ps-3 focus-within:border-primary dark:border-zinc-700 dark:bg-zinc-800">
			<input
				className="min-w-0 flex-1 border-none bg-transparent p-0 text-xs text-zinc-700 focus:ring-0 dark:text-zinc-300"
				type="url"
				value={url}
				readOnly
				aria-label={m.share_link_label()}
			/>
			<button
				type="button"
				className={ICON_BUTTON_CLASS_NAME}
				onClick={copy}
				aria-label={copied ? m.share_copied() : m.share_link_copy()}
			>
				<ShareIcon name={copied ? "check" : "copy"} />
			</button>
			{share === undefined ? null : (
				<button
					type="button"
					className={ICON_BUTTON_CLASS_NAME}
					onClick={share}
					aria-label={m.share_link_share()}
				>
					<ShareIcon name="share" />
				</button>
			)}
			<span className="sr-only" aria-live="polite">
				{copied ? m.share_copied() : ""}
			</span>
		</div>
	);
});
ShareLinkRow.displayName = "ShareLinkRow";
