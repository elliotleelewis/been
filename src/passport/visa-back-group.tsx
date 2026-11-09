import { memo } from "react";
import type { FC } from "react";

import type { VisaBackGroup as VisaBackGroupModel } from "./types.ts";
import { VisaBackEntry } from "./visa-back-entry.tsx";

interface Props {
	readonly group: VisaBackGroupModel;
	/** The country whose tick earned the visa, if there is telling. */
	readonly clincher: string | undefined;
}

/**
 * The countries for one of a visa's requirements, as its back lists them: what the requirement is,
 * where the visa asks for more than one thing, the countries that met it, numbered in the order they
 * were ticked, then any others that also count.
 */
export const VisaBackGroup: FC<Props> = memo(({ clincher, group: { earned, extra, label } }) => (
	<section className="mb-[2cqw]">
		{label === undefined ? null : (
			<h3 className="text-[2.2cqw] font-bold tracking-[0.5cqw] text-current">
				{label.toUpperCase()}
			</h3>
		)}
		<ol>
			{earned.map((entry, index) => (
				<VisaBackEntry
					key={entry.country.iso3166}
					entry={entry}
					place={index + 1}
					clincher={entry.country.iso3166 === clincher}
				/>
			))}
		</ol>
		{extra.length === 0 ? null : (
			<h4 className="mt-[1.5cqw] flex items-center gap-[1.5cqw] text-[2cqw] font-semibold tracking-[0.5cqw] opacity-60 before:h-px before:flex-1 before:bg-current after:h-px after:flex-1 after:bg-current">
				{"ALSO COUNTS"}
			</h4>
		)}
		{extra.length === 0 ? null : (
			<p className="opacity-80">{extra.map(({ name }) => name).join(", ")}</p>
		)}
	</section>
));
VisaBackGroup.displayName = "VisaBackGroup";
