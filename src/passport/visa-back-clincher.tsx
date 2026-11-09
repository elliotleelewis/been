import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { Stamp } from "./stamp.tsx";
import type { VisaBack } from "./types.ts";

interface Props {
	readonly clincher: VisaBack["clincher"];
}

/**
 * The left of a visa's back: the stamp of the country whose tick earned it, its name, the day and
 * what that tick was. Where the tick is older than dates being kept, there is no telling which one
 * it was, and it says so.
 */
export const VisaBackClincher: FC<Props> = memo(({ clincher }) =>
	clincher === undefined ? (
		<p className="self-center text-center text-[2.6cqw] italic opacity-70">
			{m.passport_visa_undated_back()}
		</p>
	) : (
		<div className="flex min-w-0 flex-col items-center text-center">
			<span className="text-[2cqw] font-semibold tracking-[0.6cqw] opacity-60">
				{"CLINCHED BY"}
			</span>
			<div className="my-[1cqw] size-[21cqw] mix-blend-multiply">
				<Stamp stamp={clincher.stamp} />
			</div>
			<span className="w-full truncate text-[3.4cqw] font-extrabold text-current">
				{clincher.stamp.country.name.toUpperCase()}
			</span>
			<span className="text-[2.6cqw] font-bold">{clincher.stamp.date}</span>
			<span className="text-[2.4cqw] italic opacity-70">{clincher.caption}</span>
		</div>
	),
);
VisaBackClincher.displayName = "VisaBackClincher";
