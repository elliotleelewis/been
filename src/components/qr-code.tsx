import { memo, useMemo } from "react";
import type { FC } from "react";

import { useQrCode } from "../hooks/use-qr-code";
import { qrSvgOf } from "../utils/qr";

interface Props {
	/** What the code encodes, which a phone's camera opens when it reads it. */
	readonly text: string;
	/** What a screen reader says the image is. */
	readonly label: string;
}

/**
 * A QR code for `text`. It is dark on light in either colour scheme: plenty of scanners cannot read
 * a code drawn the other way round.
 */
export const QrCode: FC<Props> = memo(({ label, text }) => {
	const modules = useQrCode(text);
	const src = useMemo(
		() =>
			modules === undefined
				? undefined
				: `data:image/svg+xml,${encodeURIComponent(qrSvgOf(modules))}`,
		[modules],
	);

	return (
		<div className="size-48 overflow-hidden rounded-lg bg-white">
			{src === undefined ? null : (
				<img className="size-full [image-rendering:pixelated]" src={src} alt={label} />
			)}
		</div>
	);
});
QrCode.displayName = "QrCode";
