import { memo } from "react";
import type { FC } from "react";

import { useShareLink } from "../hooks/use-share-link";
import { QrCode } from "./qr-code";

interface Props {
	/** The link to share. */
	readonly url: string;
	/** Closes the dialog the link is shared from. */
	readonly onDone: () => void;
}

const BUTTON_CLASS_NAME =
	"rounded-full px-4 py-2 font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

/** A link to share: as a QR code to show in person, and as text to copy or send. */
export const ShareLink: FC<Props> = memo(({ onDone, url }) => {
	const { copied, copy, share } = useShareLink(url);

	return (
		<>
			<QrCode label="QR code for the link to your map" text={url} />
			<input
				className="w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 focus:border-primary focus:ring-primary/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
				type="url"
				value={url}
				readOnly
				aria-label="Link to your map"
			/>
			<div className="flex w-full flex-wrap justify-center gap-2">
				<button
					type="button"
					className={`${BUTTON_CLASS_NAME} bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white`}
					onClick={copy}
				>
					{copied ? "Copied!" : "Copy link"}
				</button>
				{share === undefined ? null : (
					<button
						type="button"
						className={`${BUTTON_CLASS_NAME} bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700`}
						onClick={share}
					>
						{"Share…"}
					</button>
				)}
				<button
					type="button"
					className={`${BUTTON_CLASS_NAME} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
					onClick={onDone}
				>
					{"Done"}
				</button>
			</div>
		</>
	);
});
ShareLink.displayName = "ShareLink";
