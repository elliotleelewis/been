import { useAtomValue } from "jotai";
import { memo } from "react";
import type { FC } from "react";

import { m } from "../paraglide/messages.js";
import { mrzOf } from "./lettering.ts";
import { passportStatsAtom } from "./pages.ts";
import { PassportCrest } from "./passport-crest.tsx";

/**
 * The identity page: what would be the holder's details is the map's instead, with the two lines of
 * a machine-readable zone along its foot made out of the same numbers.
 */
export const PassportIdPage: FC = memo(() => {
	const stats = useAtomValue(passportStatsAtom);
	const fields: readonly (readonly [string, string])[] = [
		[m.passport_id_countries(), m.passport_id_count({ count: stats.count, total: stats.total })],
		[
			m.passport_id_share(),
			m.passport_id_share_value({ share: stats.total === 0 ? 0 : stats.count / stats.total }),
		],
		[m.passport_id_regions(), m.passport_id_count({ count: stats.regions, total: 5 })],
		[m.passport_id_visas(), m.passport_id_count({ count: stats.visas, total: stats.visaTotal })],
		[m.passport_id_home(), stats.home ?? "—"],
		[m.passport_id_first(), stats.first ?? "—"],
		[m.passport_id_latest(), stats.latest ?? "—"],
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
