import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { type Observable, map } from 'rxjs';

import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
	minZoom = 1.8;

	constructor(
		@Inject(CountriesService) private countriesService: CountriesService,
	) {}

	get countriesSelected$(): Observable<string[]> {
		return this.countriesService.countries$.pipe(
			map((countries) =>
				countries.filter((c) => c.selected).map((c) => c.iso3166),
			),
		);
	}
}
