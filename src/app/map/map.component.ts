import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
	type OnDestroy,
	type OnInit,
} from '@angular/core';
import { type Map } from 'mapbox-gl';
import { type Observable, map } from 'rxjs';
import { SubSink } from 'subsink';

import {
	type Coordinate,
	type NestedCoordinates,
	getCoordsCenter,
} from '../helpers';
import { CountriesService } from '../services/countries.service';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
	@HostBinding('class')
	class = 'flex flex-col';

	map?: Map;

	center?: Coordinate;
	minZoom = 1.8;

	private _subs = new SubSink();

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

	ngOnInit(): void {
		this._subs.sink = this.countriesService.focus$.subscribe((country) => {
			const query = this.map?.querySourceFeatures('countries', {
				sourceLayer: 'country_boundaries',
				filter: ['==', ['get', 'iso_3166_1'], country],
			});
			const feature = query?.[0];
			if (feature) {
				const { coordinates } = feature.geometry as {
					coordinates?: NestedCoordinates;
				};
				if (coordinates) {
					this.center = getCoordsCenter(coordinates);
				}
			}
		});
	}

	ngOnDestroy(): void {
		this._subs.unsubscribe();
	}

	onMapLoad(map: Map): void {
		this.map = map;
	}
}
