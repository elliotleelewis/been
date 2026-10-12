import { memo, useRef } from "react";
import type { FC } from "react";
import { useToastRegion } from "react-aria";

import { useTapToasts } from "../hooks/use-tap-toasts";
import { TapToast } from "./tap-toast";

/**
 * The landmark the tap toasts live in. React Aria makes it reachable with F6, holds every toast's
 * clock still while the pointer or focus is in it, and hands focus back to wherever it came from
 * when a toast it held goes away. It only exists while there is a toast to show. It spans the
 * globe's width to centre its toast, so when it takes focus, the ring goes round the toast instead.
 */
export const TapToastRegion: FC = memo(() => {
	const state = useTapToasts();
	const ref = useRef<HTMLDivElement>(null);
	const { regionProps } = useToastRegion({}, state, ref);

	return state.visibleToasts.length === 0 ? null : (
		<div
			// oxlint-disable-next-line react/jsx-props-no-spreading -- The region props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
			{...regionProps}
			ref={ref}
			className="group pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center px-4 focus:outline-none"
		>
			{state.visibleToasts.map((toast) => (
				<TapToast key={toast.key} state={state} toast={toast} />
			))}
		</div>
	);
});
TapToastRegion.displayName = "TapToastRegion";
