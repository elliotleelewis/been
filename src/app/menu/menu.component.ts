import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
} from '@angular/core';
import type { Observable } from 'rxjs';

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

	constructor(
		@Inject(CountriesService) private countriesService: CountriesService,
	) {}

	get regions$(): Observable<Region[]> {
		return this.countriesService.regions$;
	}

	toggleCountry(country: Country): void {
		if (country.selected) {
			this.countriesService.removeCountry(country.iso3166);
		} else {
			this.countriesService.addCountry(country.iso3166);
		}
	}
}
