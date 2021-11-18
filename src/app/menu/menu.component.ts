import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';

import { Country } from '../models/country';
import { Region } from '../models/region';
import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
	regions: Region[] = [];

	private _subs = new SubSink();

	constructor(private countriesService: CountriesService) {}

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

	getCountryCode(_: number, country: Country): string {
		return country.iso3166;
	}

	getRegionName(_: number, region: Region): string {
		return region.name;
	}
}
