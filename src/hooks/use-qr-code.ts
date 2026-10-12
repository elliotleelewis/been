import { useEffect, useState } from "react";
import type { QrCodeGenerateResult } from "uqr";

/**
 * React Compiler cannot lower an import expression, so the dynamic import that keeps the encoder
 * out of the main bundle sits at module scope rather than inside the effect that calls it.
 */
const encodeQrCode = async (text: string): Promise<QrCodeGenerateResult> => {
	const { encode } = await import("uqr");
	return encode(text, { border: 4, ecc: "M" });
};

/** A QR code's modules, and the text they were encoded from. */
interface EncodedQrCode {
	readonly modules: readonly (readonly boolean[])[];
	readonly text: string;
}

/**
 * The modules of a QR code for `text`, or `undefined` while the encoder loads. The encoder is only
 * fetched the first time a code is asked for, so nobody who never shares their map downloads it.
 * The quiet zone round the code is part of what it returns, as a scanner needs one to find it.
 */
export const useQrCode = (text: string): readonly (readonly boolean[])[] | undefined => {
	const [encoded, setEncoded] = useState<EncodedQrCode>();

	useEffect(() => {
		let current = true;
		encodeQrCode(text)
			.then(({ data }) => {
				if (current) {
					setEncoded({ modules: data, text });
				}
			})
			.catch((cause: unknown) => {
				console.error("Failed to load the QR code encoder.", cause);
			});
		return (): void => {
			current = false;
		};
	}, [text]);

	return encoded?.text === text ? encoded.modules : undefined;
};
