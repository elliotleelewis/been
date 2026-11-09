import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { LockedVisaCard } from "./locked-visa-card.tsx";
import { lockedVisasAtom } from "./locked-visas.ts";
import { VISAS_PER_PAGE } from "./types.ts";

interface Props {
	/** Which page of visas within reach this is, the first being 0. */
	readonly index: number;
}

/**
 * A page of the visas the map is nearest to, locked, laid out as a page of visas earned is, each of
 * which turns over to list the countries that would earn it.
 */
export const PassportLockedPage: FC<Props> = memo(({ index }) => {
	const visas = useAtomValue(lockedVisasAtom);
	const page = visas.slice(index * VISAS_PER_PAGE, (index + 1) * VISAS_PER_PAGE);

	return (
		<ul className="grid size-full grid-rows-2 gap-[5.6cqw] px-[4.2cqw] py-[6.9cqw]">
			{page.map((visa) => (
				<li key={visa.achievement.id} className="flex items-center">
					<LockedVisaCard visa={visa} />
				</li>
			))}
		</ul>
	);
});
PassportLockedPage.displayName = "PassportLockedPage";
