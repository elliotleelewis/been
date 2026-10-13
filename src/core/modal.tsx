import { memo, useRef } from "react";
import type { FC, ReactNode } from "react";
import { Overlay, useModalOverlay } from "react-aria";
import type { OverlayTriggerState } from "react-stately";

interface Props {
	readonly children: ReactNode;
	readonly state: OverlayTriggerState;
}

/**
 * A modal over the whole page: a dimmed underlay, closed by a click on it or by Escape, with the
 * rest of the page hidden from assistive technology and focus kept inside while it is open.
 */
export const Modal: FC<Props> = memo(({ children, state }) => {
	const ref = useRef<HTMLDivElement>(null);
	const { modalProps, underlayProps } = useModalOverlay({ isDismissable: true }, state, ref);

	return (
		<Overlay>
			<div
				// oxlint-disable-next-line react/jsx-props-no-spreading -- The underlay props are react-aria's interface, and naming them here would freeze a list that is react-aria's to change.
				{...underlayProps}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
			>
				{/* oxlint-disable-next-line react/jsx-props-no-spreading -- As above, for the modal. */}
				<div {...modalProps} ref={ref}>
					{children}
				</div>
			</div>
		</Overlay>
	);
});
Modal.displayName = "Modal";
