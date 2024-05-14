import type { OnDestroy, OnInit } from '@angular/core';
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
} from '@angular/core';
import { SubSink } from 'subsink';

import type { Country } from '../models/country';
import type { Region } from '../models/region';
import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit, OnDestroy {
	@HostBinding('class')
	class = 'flex flex-col';

	regions: Region[] = [];

	private _subs = new SubSink();

	constructor(
		@Inject(CountriesService) private countriesService: CountriesService,
	) {}

	ngOnInit(): void {
		this._subs.sink = this.countriesService.regions$.subscribe(
			(regions) => (this.regions = regions),
		);
	}

	ngOnDestroy(): void {
		this._subs.unsubscribe();
	}

	toggleCountry(country: Country): void {
		if (country.selected) {
			this.countriesService.removeCountry(country.iso3166);
		} else {
			this.countriesService.addCountry(country.iso3166);
		}
	}
}
