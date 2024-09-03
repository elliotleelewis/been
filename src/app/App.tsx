import { type FC } from 'react';

import { CountriesProvider } from './contexts/CountriesContext';
import { Header } from './header/Header';
import { Map } from './map/Map';
import { Menu } from './menu/Menu';

export const App: FC = () => {
	return (
		<CountriesProvider>
			<div className="flex h-full flex-col-reverse sm:flex-row">
				<div className="flex basis-1/3 flex-col overflow-auto dark:bg-zinc-900 dark:text-white">
					<Menu header={<Header show="tablet" />} />
				</div>
				<div className="basis-2/3">
					<Map header={<Header />} />
				</div>
			</div>
		</CountriesProvider>
	);
};
