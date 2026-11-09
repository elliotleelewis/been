import { memo } from "react";
import type { FC, ReactNode } from "react";

interface Props {
	readonly heading: string;
	readonly children: ReactNode;
}

/** A section of a legal page: its heading, then whatever it says. */
export const LegalSection: FC<Props> = memo(({ children, heading }) => (
	<section>
		<h2 className="mt-12 text-2xl font-bold">{heading}</h2>
		{children}
	</section>
));
LegalSection.displayName = "LegalSection";
