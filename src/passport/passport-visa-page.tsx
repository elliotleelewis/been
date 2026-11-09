import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { VISAS_PER_PAGE } from "./types.ts";
import { VisaCard } from "./visa-card.tsx";
import { visasAtom } from "./visas.ts";

interface Props {
	/** Which page of visas this is, the first being 0. */
	readonly index: number;
}

/**
 * A page of visas, one above the other, as a passport's visa pages hold them, each of which turns
 * over to show the countries that earned it.
 */
export const PassportVisaPage: FC<Props> = memo(({ index }) => {
	const visas = useAtomValue(visasAtom);
	const page = visas.slice(index * VISAS_PER_PAGE, (index + 1) * VISAS_PER_PAGE);

	return (
		<ul className="grid size-full grid-rows-2 gap-[5.6cqw] px-[4.2cqw] py-[6.9cqw]">
			{page.map((visa) => (
				<li key={visa.achievement.id} className="flex items-center">
					<VisaCard visa={visa} />
				</li>
			))}
		</ul>
	);
});
PassportVisaPage.displayName = "PassportVisaPage";
