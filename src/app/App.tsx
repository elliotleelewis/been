import { type FC } from 'react';

import { CountriesProvider } from './contexts/countries-context';
import { Header } from './header/header';
import { Map } from './map/map';
import { Menu } from './menu/menu';

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
