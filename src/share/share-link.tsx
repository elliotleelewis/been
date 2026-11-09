import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { QrCode } from "./qr-code.tsx";
import { ShareLinkRow } from "./share-link-row.tsx";
import { ShareSummary } from "./share-summary.tsx";

interface Props {
	/** The link to share. */
	readonly url: string;
}

/**
 * A map to share: its link as a QR code to show in person, and as text to copy or send, then the
 * map summed up in emoji, to paste anywhere.
 */
export const ShareLink: FC<Props> = memo(({ url }) => (
	<>
		<QrCode label={m.share_qr_label()} caption={m.share_qr_caption()} text={url} />
		<ShareLinkRow url={url} />
		<ShareSummary />
	</>
));
ShareLink.displayName = "ShareLink";
