import { memo, useRef } from "react";
import type { FC } from "react";

import type { Visa } from "./types.ts";
import { useFoil } from "./use-foil.ts";
import { VisaFace } from "./visa-face.tsx";

interface Props {
	/** The visas, the first on top, each of the rest a little further down and to the right. */
	readonly visas: readonly Visa[];
}

/** How far each visa in the stack sits from the one above it, across and down, in pixels. */
const STEP = 10;

/**
 * A stack of visas, as the visa moment sticks them in, under a light of its own that drifts over
 * any foil among them.
 */
export const VisaStack: FC<Props> = memo(({ visas }) => {
	const light = useRef<HTMLDivElement>(null);
	useFoil(light, true);

	return (
		<div ref={light} className="foil-lit grid">
			{visas.toReversed().map((visa, index) => (
				<div
					key={visa.achievement.id}
					className="[grid-area:1/1]"
					style={{
						transform: `translate(${String((visas.length - 1 - index) * STEP)}px, ${String((visas.length - 1 - index) * STEP)}px)`,
					}}
				>
					<VisaFace visa={visa} />
				</div>
			))}
		</div>
	);
});
VisaStack.displayName = "VisaStack";
