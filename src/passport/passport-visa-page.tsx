import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { VISAS_PER_PAGE } from "./types.ts";
import { Visa } from "./visa.tsx";
import { visasAtom } from "./visas.ts";

interface Props {
	/** Which page of visas this is, the first being 0. */
	readonly index: number;
}

/** A page of visas, one above the other, as a passport's visa pages hold them. */
export const PassportVisaPage: FC<Props> = memo(({ index }) => {
	const visas = useAtomValue(visasAtom);
	const page = visas.slice(index * VISAS_PER_PAGE, (index + 1) * VISAS_PER_PAGE);

	return (
		<ul className="grid size-full grid-rows-2 gap-4 px-3 py-5">
			{page.map((visa) => (
				<li key={visa.achievement.id} className="flex items-center">
					<Visa visa={visa} />
					<span className="sr-only">
						{visa.date === undefined
							? m.passport_visa_undated(visa.achievement)
							: m.passport_visa_dated({ ...visa.achievement, date: visa.date })}
					</span>
				</li>
			))}
		</ul>
	);
});
PassportVisaPage.displayName = "PassportVisaPage";
