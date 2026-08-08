import { memo } from "react";
import type { FC } from "react";
import type { Region } from "../models/region";
import { MenuItem } from "./menu-item";
import { Progress } from "./progress";

interface Props {
	readonly loading: boolean;
	readonly regions: readonly Region[];
}

export const MenuBody: FC<Props> = memo(({ loading, regions }) => {
	if (loading) {
		return (
			<div className="flex size-full items-center justify-center">
				<svg
					className="size-5 animate-spin text-neutral-800 dark:text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<title>{"Loading!"}</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
		);
	}

	if (regions.length === 0) {
		return <div className="m-4 h-full text-center font-medium">{"No results!"}</div>;
	}

	return (
		<ul className="h-full overflow-y-auto">
			{regions.map((region) => (
				<li key={region.name}>
					<div className="sticky top-0 flex items-center justify-between bg-zinc-200 p-4 font-medium dark:bg-zinc-800">
						<h2>{region.name || "Other"}</h2>
						<Progress complete={region.complete ?? 0} />
					</div>
					<ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{region.values.map((country) => (
							<MenuItem key={country.iso3166} country={country} />
						))}
					</ul>
				</li>
			))}
		</ul>
	);
});
MenuBody.displayName = "MenuBody";
