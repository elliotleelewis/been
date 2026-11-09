import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";
import { memo, useCallback, useId, useMemo } from "react";
import type { ChangeEvent, FC } from "react";

import { m } from "../paraglide/messages.js";
import { shareSummaryAtom, summaryIncludesLinkAtom } from "./share.ts";
import { useSharing } from "./use-sharing.ts";

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

/**
 * The map summed up in emoji, as it will paste, with whether to end it with the link, and buttons
 * to copy it or post it through the device's share sheet where there is one.
 */
export const ShareSummary: FC = memo(() => {
	const summary = useAtomValue(shareSummaryAtom);
	const [includesLink, setIncludesLink] = useAtom(summaryIncludesLinkAtom);
	const data = useMemo(() => ({ text: summary }), [summary]);
	const { copied, copy, share } = useSharing(summary, data);
	const headingId = useId();

	const toggleLink = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setIncludesLink(event.target.checked);
		},
		[setIncludesLink],
	);

	return (
		<section className="flex w-full flex-col gap-3" aria-labelledby={headingId}>
			<h3 id={headingId} className="font-semibold text-sm">
				{m.share_emoji_heading()}
			</h3>
			<output
				className="block max-h-48 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-xs/relaxed break-all whitespace-pre-wrap text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
				aria-label={m.share_emoji_label()}
			>
				{summary}
			</output>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
					<input
						type="checkbox"
						className="rounded text-primary focus:ring-primary/50 dark:bg-zinc-800"
						checked={includesLink}
						onChange={toggleLink}
					/>
					{m.share_emoji_include_link()}
				</label>
				<div className="flex gap-2">
					{share === undefined ? null : (
						<button
							type="button"
							className={classNames(
								BUTTON_CLASS_NAME,
								"bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
							)}
							onClick={share}
						>
							{m.share_emoji_post()}
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
			</div>
		</section>
	);
});
ShareSummary.displayName = "ShareSummary";
