import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback } from "react";
import type { FC } from "react";

import type { Country } from "../core/types.ts";
import { m } from "../paraglide/messages.js";
import { PassportStampSlot } from "./passport-stamp-slot.tsx";
import { passportStampsAtom, showCountryAtom } from "./stamps.ts";
import { STAMPS_PER_PAGE } from "./types.ts";

interface Props {
	/** Which page of stamps this is, the first being 0. */
	readonly index: number;
	/** Closes the passport, so the globe can be seen framing a stamp's country. */
	readonly onClose: () => void;
}

/** A page of stamps, two across and three down, each a little off its place as if pressed by hand. */
export const PassportStampPage: FC<Props> = memo(({ index, onClose }) => {
	const stamps = useAtomValue(passportStampsAtom);
	const showCountry = useSetAtom(showCountryAtom);
	const show = useCallback(
		(country: Country) => {
			showCountry(country);
			onClose();
		},
		[onClose, showCountry],
	);
	const page = stamps.slice(index * STAMPS_PER_PAGE, (index + 1) * STAMPS_PER_PAGE);

	return page.length === 0 ? (
		<p className="flex size-full items-center justify-center p-8 text-center text-[#3b3a35]/70 text-sm dark:text-[#3b3a35]/70">
			{m.passport_stamps_empty()}
		</p>
	) : (
		<ul className="grid size-full grid-cols-2 grid-rows-3 gap-1 p-3">
			{page.map((stamp) => (
				<PassportStampSlot key={stamp.country.iso3166} stamp={stamp} onShow={show} />
			))}
		</ul>
	);
});
PassportStampPage.displayName = "PassportStampPage";
