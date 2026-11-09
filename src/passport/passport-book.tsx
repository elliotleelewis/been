import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useRef } from "react";
import type { FC } from "react";

import { passportOpeningOfAtom, passportPageAtom, turnPassportPageAtom } from "./pages.ts";
import { PassportSheet } from "./passport-sheet.tsx";
import type { SheetPlace } from "./passport-sheet.tsx";
import { askForDeviceTilt, useFoil } from "./use-foil.ts";

interface Props {
	/** Whether it lies open two pages at a time, as it does on screens wide enough. */
	readonly spread: boolean;
	/** Closes the passport. */
	readonly onClose: () => void;
}

/** Where each of the sheets on show lies, by how many there are. */
const PLACES: readonly (readonly SheetPlace[])[] = [[], ["alone"], ["left", "right"]];

/**
 * The passport at the pages it is open at: its cover alone, then a page at a time, or, on a screen
 * wide enough, two facing each other across the spine, as a real passport lies open. It leans
 * towards the light, which follows the reader's pointer or the tilt of their device, and any foil
 * visa on its pages catches the same light. Each page turns in as it opens, unless the reader has
 * asked for less motion.
 */
export const PassportBook: FC<Props> = memo(({ onClose, spread }) => {
	const index = useAtomValue(passportPageAtom);
	const { shown } = useAtomValue(passportOpeningOfAtom)(spread);
	const turnPage = useSetAtom(turnPassportPageAtom);
	const light = useRef<HTMLDivElement>(null);
	useFoil(light, true);
	const open = useCallback(() => {
		// Opening the cover is the one tap iOS gives to ask for the device's tilt, which the light follows.
		askForDeviceTilt();
		turnPage({ by: 1, spread });
	}, [spread, turnPage]);
	const places = PLACES[shown.length] ?? [];

	return (
		<div ref={light} className="foil-lit flex drop-shadow-xl">
			{shown.map((page, side) => (
				<PassportSheet
					// Keyed by the page open at, so each turn plays the page in afresh.
					// oxlint-disable-next-line react/no-array-index-key -- The side is what tells the sheets in a spread apart.
					key={`${String(index)}:${String(side)}`}
					page={page}
					place={places[side] ?? "alone"}
					spread={spread}
					onOpen={open}
					onClose={onClose}
				/>
			))}
		</div>
	);
});
PassportBook.displayName = "PassportBook";
