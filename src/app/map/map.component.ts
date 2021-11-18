import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';

import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
	minZoom = 1;

	filter = ['in', 'iso_3166_1'];

	private _subs = new SubSink();

	constructor(private countriesService: CountriesService) {}

	ngOnInit(): void {
		this._subs.sink = this.countriesService.countries$.subscribe(
			(countries) => {
				this.filter = [
					'in',
					'iso_3166_1',
					...countries
						.filter((c) => c.selected)
						.map((c) => c.iso3166),
				];
			},
		);
	}

	ngOnDestroy(): void {
		this._subs.unsubscribe();
	}
}
