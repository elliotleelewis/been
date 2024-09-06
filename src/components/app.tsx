import { type FC, memo, useMemo } from 'react';

import { CountriesProvider } from '../contexts/countries-provider';
import countriesJson from '../data/countries.json';
import { type Country } from '../models/country';

import { Header } from './header';
import { Map } from './map';
import { Menu } from './menu';

interface Props {
	data?: readonly Country[];
}

export const App: FC<Props> = memo(({ data = countriesJson }) => {
	const menuHeader = useMemo(() => <Header show="tablet" />, []);
	const mapHeader = useMemo(() => <Header />, []);

	return (
		<CountriesProvider data={data}>
			<div className="flex h-full flex-col-reverse sm:flex-row">
				<div className="flex basis-1/3 flex-col overflow-auto dark:bg-zinc-900 dark:text-white">
					<Menu header={menuHeader} />
				</div>
				<div className="basis-2/3">
					<Map header={mapHeader} />
				</div>
			</div>
		</CountriesProvider>
	);
});
