import classNames from "classnames";
import { useAtomValue } from "jotai";
import { memo, useMemo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { shareSummaryAtom } from "./share.ts";
import { useSharing } from "./use-sharing.ts";

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

/**
 * The map summed up in emoji, ending with its link, as it will paste, with buttons to copy it or
 * send it through the device's share sheet where there is one.
 */
export const ShareSummary: FC = memo(() => {
	const summary = useAtomValue(shareSummaryAtom);
	const data = useMemo(() => ({ text: summary }), [summary]);
	const { copied, copy, share } = useSharing(summary, data);

	return (
		<>
			<output
				className="block w-full rounded-lg bg-zinc-50 p-3 text-xs/relaxed break-all whitespace-pre-wrap text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
				aria-label={m.share_emoji_label()}
			>
				{summary}
			</output>
			<div className="flex w-full justify-end gap-2">
				{share === undefined ? null : (
					<button
						type="button"
						className={classNames(
							BUTTON_CLASS_NAME,
							"bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
						)}
						onClick={share}
					>
						{m.share_emoji_share()}
					</button>
				)}
				<button
					type="button"
					className={classNames(
						BUTTON_CLASS_NAME,
						"bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white",
					)}
					onClick={copy}
				>
					{copied ? m.share_copied() : m.share_emoji_copy()}
				</button>
			</div>
		</>
	);
});
ShareSummary.displayName = "ShareSummary";
