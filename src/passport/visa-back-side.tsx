import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { Stamp } from "./stamp.tsx";
import type { VisaBackSide as VisaBackSideModel } from "./types.ts";

/** How many of the countries still to go for a visa are named, before the rest are counted. */
const NAMED = 3;

interface Props {
	readonly side: VisaBackSideModel;
}

/**
 * The left of a visa's back. On the reader's own map, it is the stamp of the country whose tick
 * earned it, its name, the day and what that tick was; where the tick is older than dates being
 * kept, there is no telling which one it was, and it says so. On a shared map, it says how the
 * reader's own stands on the visa, or, with no map of their own, why there is no telling.
 */
export const VisaBackSide: FC<Props> = memo(({ side }) => {
	if (side.kind === "clincher") {
		return (
			<div className="flex min-w-0 flex-col items-center text-center">
				<span className="text-[2cqw] font-semibold tracking-[0.6cqw] opacity-60">
					{"CLINCHED BY"}
				</span>
				<div className="my-[1cqw] size-[21cqw] mix-blend-multiply">
					<Stamp stamp={side.stamp} />
				</div>
				<span className="w-full truncate text-[3.4cqw] font-extrabold text-current">
					{side.stamp.country.name.toUpperCase()}
				</span>
				<span className="text-[2.6cqw] font-bold">{side.stamp.date}</span>
				<span className="text-[2.4cqw] italic opacity-70">{side.caption}</span>
			</div>
		);
	}
	if (side.kind === "held") {
		return (
			<div className="flex min-w-0 flex-col items-center self-center text-center">
				<span className="text-[2cqw] font-semibold tracking-[0.6cqw] opacity-60">
					{"YOUR PASSPORT"}
				</span>
				<span
					className="my-[1.5cqw] grid size-[14cqw] -rotate-6 place-items-center rounded-full border-[0.8cqw] border-current text-[7cqw] font-extrabold text-current"
					aria-hidden="true"
				>
					{"✓"}
				</span>
				<span className="text-[2.8cqw] font-bold">{m.passport_visa_compare_held()}</span>
				{side.date === undefined ? null : (
					<span className="text-[2.6cqw] tabular-nums opacity-70">{side.date}</span>
				)}
			</div>
		);
	}
	if (side.kind === "within") {
		const named = side.countries.slice(0, NAMED).map(({ name }) => name);
		const more = side.remaining - named.length;
		return (
			<div className="flex min-w-0 flex-col items-center self-center text-center">
				<span className="text-[2cqw] font-semibold tracking-[0.6cqw] opacity-60">
					{"YOUR PASSPORT"}
				</span>
				<span className="my-[1cqw] text-[8cqw] leading-none font-extrabold text-current tabular-nums">
					{side.remaining}
				</span>
				<span className="text-[2.8cqw] font-bold">
					{m.passport_visa_compare_away({ count: side.remaining })}
				</span>
				{named.length === 0 ? null : (
					<span className="mt-[1cqw] text-[2.4cqw] italic opacity-70">
						{more > 0
							? m.passport_visa_compare_countries_more({
									count: more,
									countries: named.join(", "),
								})
							: m.passport_visa_compare_countries({ countries: named.join(", ") })}
					</span>
				)}
			</div>
		);
	}
	return (
		<p className="self-center text-center text-[2.6cqw] italic opacity-70">
			{side.kind === "shared" ? m.passport_visa_shared_back() : m.passport_visa_undated_back()}
		</p>
	);
});
VisaBackSide.displayName = "VisaBackSide";
