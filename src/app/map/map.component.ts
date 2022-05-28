import type { OnDestroy, OnInit } from '@angular/core';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
} from '@angular/core';
import { SubSink } from 'subsink';

import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
	minZoom = 1;

	filter = ['in', 'iso_3166_1'];

	private _subs = new SubSink();

	constructor(
		@Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef,
		@Inject(CountriesService) private countriesService: CountriesService,
	) {}

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
				this.changeDetectorRef.detectChanges();
			},
		);
	}

	ngOnDestroy(): void {
		this._subs.unsubscribe();
	}
}
