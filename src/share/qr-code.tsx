import { memo, useMemo } from "react";
import type { FC } from "react";

import { QR_BORDER, qrSvgOf } from "./qr.ts";
import { useQrCode } from "./use-qr-code.ts";

interface Props {
	/** What the code encodes, which a phone's camera opens when it reads it. */
	readonly text: string;
	/** What a screen reader says the image is. */
	readonly label: string;
}

/**
 * A QR code for `text`, in the app's colours on the passport's paper. It is dark on light in either colour scheme: plenty of scanners cannot read a
 * code drawn the other way round.
 */
export const QrCode: FC<Props> = memo(({ label, text }) => {
	const modules = useQrCode(text);
	const src = useMemo(
		() =>
			modules === undefined
				? undefined
				: `data:image/svg+xml,${encodeURIComponent(qrSvgOf(modules, QR_BORDER))}`,
		[modules],
	);

	return (
		<div className="rounded-2xl bg-[#fbf7ec] p-2 shadow-sm ring-1 ring-[#c2410c]/30 dark:bg-[#fbf7ec] dark:ring-[#c2410c]/50">
			<div className="size-48">
				{src === undefined ? null : <img className="size-full" src={src} alt={label} />}
			</div>
		</div>
	);
});
QrCode.displayName = "QrCode";
