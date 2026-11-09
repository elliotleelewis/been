import { memo } from "react";
import type { FC } from "react";

import { FACTS_CLASS_NAME, STORED_THINGS } from "./types.ts";

/** Every key the app keeps something under in local storage, each beside what it is. */
export const StorageFacts: FC = memo(() => (
	<dl className={FACTS_CLASS_NAME}>
		{STORED_THINGS.map(({ key, what }) => (
			<div key={key} className="contents">
				<dt className="font-mono text-sm">{key}</dt>
				<dd>{what()}</dd>
			</div>
		))}
	</dl>
));
StorageFacts.displayName = "StorageFacts";
