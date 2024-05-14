import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
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

import type { Country } from '../models/country';
import type { Region } from '../models/region';
import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
	@HostBinding('class')
	class = 'flex flex-col';

	searchControl = new FormControl('', { nonNullable: true });

	constructor(
		@Inject(CountriesService) private countriesService: CountriesService,
	) {}

	get filteredRegions$(): Observable<Region[]> {
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
							? regions.map((region) => ({
									...region,
									values: region.values.filter(({ name }) =>
										name.toLowerCase().includes(search),
									),
								}))
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
