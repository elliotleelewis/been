import { type FC, memo } from 'react';

interface Props {
	complete: number;
}

export const Progress: FC<Props> = memo(({ complete }) => (
	<div className="relative size-5">
		<svg
			className="-rotate-90 size-full"
			viewBox="0 0 36 36"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{Math.round(complete * 1000) / 10}% complete.</title>
			<circle
				cx="18"
				cy="18"
				r="16"
				fill="none"
				className="stroke-current text-gray-500 dark:text-neutral-500"
				strokeWidth="4"
			/>
			<circle
				cx="18"
				cy="18"
				r="16"
				fill="none"
				className="stroke-current text-primary dark:text-primary"
				strokeWidth="4"
				strokeDasharray="100"
				strokeDashoffset={(1 - complete) * 100}
				strokeLinecap="round"
			/>
		</svg>
	</div>
));
Progress.displayName = 'Progress';
