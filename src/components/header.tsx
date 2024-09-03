import classnames from 'classnames';
import { FC, useMemo } from 'react';

interface Props {
	show?: 'mobile' | 'tablet';
}

export const Header: FC<Props> = ({ show = 'mobile' }) => {
	const showMobile = show === 'mobile';
	const showTablet = show === 'tablet';

	const classes = useMemo(() => {
		return classnames(
			'items-center',
			'justify-center',
			'bg-primary',
			'text-white',
			'dark:bg-zinc-950',
			'dark:text-primary',
			showMobile && ['flex', 'sm:hidden'],
			showTablet && ['hidden', 'sm:flex'],
		);
	}, [showMobile, showTablet]);

	return (
		<div className={classes}>
			<h1 className="p-3 text-xl font-bold tracking-wide">been</h1>
		</div>
	);
};
