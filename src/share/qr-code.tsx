import { memo, useMemo } from "react";
import type { FC } from "react";

import { QR_BORDER, qrSvgOf } from "./qr.ts";
import { useQrCode } from "./use-qr-code.ts";

interface Props {
	/** What the code encodes, which a phone's camera opens when it reads it. */
	readonly text: string;
	/** What a screen reader says the image is. */
	readonly label: string;
	/** What the line beneath it says to whoever is shown it. */
	readonly caption: string;
}

/**
 * A QR code for `text`, in the app's colours on the passport's paper, with a line beneath saying
 * what it is for. It is dark on light in either colour scheme: plenty of scanners cannot read a
 * code drawn the other way round.
 */
export const QrCode: FC<Props> = memo(({ caption, label, text }) => {
	const modules = useQrCode(text);
	const src = useMemo(
		() =>
			modules === undefined
				? undefined
				: `data:image/svg+xml,${encodeURIComponent(qrSvgOf(modules, QR_BORDER))}`,
		[modules],
	);

	return (
		<figure className="flex flex-col items-center rounded-2xl bg-[#fbf7ec] px-2 pt-2 pb-3 shadow-sm ring-1 ring-[#c2410c]/30 dark:bg-[#fbf7ec] dark:ring-[#c2410c]/50">
			<div className="size-48">
				{src === undefined ? null : <img className="size-full" src={src} alt={label} />}
			</div>
			<figcaption className="text-xs font-semibold tracking-wide text-[#7c2d12] dark:text-[#7c2d12]">
				{caption}
			</figcaption>
		</figure>
	);
});
QrCode.displayName = "QrCode";
