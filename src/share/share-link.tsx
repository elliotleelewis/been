import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { QrCode } from "./qr-code.tsx";
import { ShareSummary } from "./share-summary.tsx";

interface Props {
	/** The link to share. */
	readonly url: string;
}

/**
 * A map to share: its link as a QR code to show in person, and the map summed up in emoji, ending
 * with the link, to copy or send anywhere.
 */
export const ShareLink: FC<Props> = memo(({ url }) => (
	<>
		<QrCode label={m.share_qr_label()} text={url} />
		<ShareSummary url={url} />
	</>
));
ShareLink.displayName = "ShareLink";
