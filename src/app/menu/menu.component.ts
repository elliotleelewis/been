import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	inject,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
	type Observable,
	concat,
	defer,
	distinctUntilChanged,
	map,
	of,
	switchMap,
} from 'rxjs';

import { type Country } from '../models/country';
import { type Region } from '../models/region';
import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
	private readonly countriesService = inject(CountriesService);

	@HostBinding('class')
	class = 'flex flex-col overflow-auto dark:bg-zinc-900 dark:text-white';

	searchControl = new FormControl('', { nonNullable: true });

	get filteredRegions$(): Observable<readonly Region[]> {
		return concat(
			defer(() => of(this.searchControl.value)),
			this.searchControl.valueChanges,
		).pipe(
			distinctUntilChanged(),
			map((search) => search.trim().toLowerCase()),
			switchMap((search) =>
				this.countriesService.regions$.pipe(
					map((regions) =>
						search
							? regions
									.map((region) => ({
										...region,
										values: region.values.filter(
											({ name }) =>
												name
													.toLowerCase()
													.includes(search),
										),
									}))
									.filter(
										(region) => region.values.length > 0,
									)
							: regions,
					),
				),
			),
		);
	}

	toggleCountry(country: Country): void {
		if (country.selected) {
			this.countriesService.removeCountry(country.iso3166);
		} else {
			this.countriesService.addCountry(country.iso3166);
		}
	}
}
