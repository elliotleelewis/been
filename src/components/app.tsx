import { type FC } from 'react';

import { CountriesProvider } from '../contexts/countries-context';
import countriesJson from '../data/countries.json';
import { type Country } from '../models/country';

import { Header } from './header';
import { Map } from './map';
import { Menu } from './menu';

interface Props {
	data?: readonly Country[];
}

export const App: FC<Props> = ({ data = countriesJson }) => {
	return (
		<CountriesProvider data={data}>
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
