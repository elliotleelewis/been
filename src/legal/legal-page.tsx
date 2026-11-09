import { memo } from "react";
import type { FC, ReactNode } from "react";

import { m } from "../paraglide/messages.js";

interface Props {
	/** The small heading above the title, saying what kind of page it is. */
	readonly eyebrow: string;
	readonly heading: string;
	readonly intro: string;
	readonly children: ReactNode;
}

/**
 * A page of the site's small print, with the app's title bar across the top, which leads home, as
 * does the button at its foot. It scrolls itself, as the page under it does not.
 */
export const LegalPage: FC<Props> = memo(({ children, eyebrow, heading, intro }) => (
	<div className="size-full overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
		<header className="flex h-header items-center justify-center bg-primary text-white dark:bg-zinc-950 dark:text-primary">
			<a
				href="/"
				className="rounded font-bold text-xl tracking-wide focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none dark:focus-visible:ring-primary"
			>
				{"been"}
			</a>
		</header>
		<main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
			<p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">{eyebrow}</p>
			<h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
			<p className="mt-5 text-lg/relaxed text-zinc-700 dark:text-zinc-300">{intro}</p>
			{children}
			<p className="mt-12">
				<a
					href="/"
					className="inline-block rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:outline-none dark:text-white"
				>
					{m.legal_home()}
				</a>
			</p>
		</main>
	</div>
));
LegalPage.displayName = "LegalPage";
