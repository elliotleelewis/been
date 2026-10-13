import { useAtomValue } from "jotai";
import { memo, useMemo } from "react";
import type { FC } from "react";

import { localesAtom } from "../state/atoms";
import { passportStatsAtom } from "../state/passport-pages";
import { mrzOf } from "../utils/passport";
import { PassportCrest } from "./passport-crest";

/**
 * The identity page: what would be the holder's details is the map's instead, with the two lines of
 * a machine-readable zone along its foot made out of the same numbers.
 */
export const PassportIdPage: FC = memo(() => {
	const stats = useAtomValue(passportStatsAtom);
	const locales = useAtomValue(localesAtom);
	const share = useMemo(
		() =>
			new Intl.NumberFormat(locales, { maximumFractionDigits: 1, style: "percent" }).format(
				stats.total === 0 ? 0 : stats.count / stats.total,
			),
		[locales, stats],
	);
	const fields: readonly (readonly [string, string])[] = [
		["Countries", `${String(stats.count)} of ${String(stats.total)}`],
		["Of the world", share],
		["Regions", `${String(stats.regions)} of 5`],
		["Visas", `${String(stats.visas)} of ${String(stats.visaTotal)}`],
		["Home region", stats.home ?? "—"],
		["First stamp", stats.first ?? "—"],
		["Latest stamp", stats.latest ?? "—"],
	];

	return (
		<div className="flex size-full flex-col justify-between p-5 font-mono text-[#3b3a35] dark:text-[#3b3a35]">
			<p className="font-sans font-semibold text-[0.6rem] tracking-[0.3em]">{"PASSPORT · been"}</p>
			<div className="flex gap-4">
				<PassportCrest variant="page" />
				<dl className="grid grid-cols-1 gap-1.5 text-xs">
					{fields.map(([label, value]) => (
						<div key={label}>
							<dt className="font-sans text-[0.55rem] uppercase tracking-wider opacity-60">
								{label}
							</dt>
							<dd className="font-semibold">{value}</dd>
						</div>
					))}
				</dl>
			</div>
			<p className="break-all text-[0.55rem] leading-tight tracking-tight" aria-hidden="true">
				{mrzOf(stats).join("\n")}
			</p>
		</div>
	);
});
PassportIdPage.displayName = "PassportIdPage";
