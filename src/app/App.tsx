import { type FC } from 'react';

import { Header } from './header/Header';
import { Menu } from './menu/Menu';

export const App: FC = () => {
	return (
		<div className="flex h-full flex-col-reverse sm:flex-row">
			<div className="flex basis-1/3 flex-col overflow-auto dark:bg-zinc-900 dark:text-white">
				<Menu>
					<Header show="tablet" />
				</Menu>
			</div>
			<div className="basis-2/3">
				<app-map>
					<Header />
				</app-map>
			</div>
		</div>
	);
};
