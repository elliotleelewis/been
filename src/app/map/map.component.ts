import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	type OnDestroy,
	type OnInit,
	inject,
} from '@angular/core';
import { type Map } from 'mapbox-gl';
import { type Observable, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { SubSink } from 'subsink';

import {
	type Coordinate,
	type NestedCoordinates,
	getCoordsCenter,
} from '../helpers';
import { WindowRef } from '../refs/window.ref';
import { CountriesService } from '../hooks/countries.service';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrl: './map.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
	private readonly _countriesService = inject(CountriesService);
	private readonly _windowRef = inject(WindowRef);

	@HostBinding('class')
	class = 'flex flex-col';

	readonly darkThemeUrl = 'mapbox://styles/mapbox/dark-v11';
	readonly lightThemeUrl = 'mapbox://styles/mapbox/light-v11';
	readonly prefersDark = this._windowRef.window.matchMedia(
		'(prefers-color-scheme: dark)',
	).matches;

	map?: Map;
	center?: Coordinate;
	minZoom = 1.8;

	private _subs = new SubSink();

	get countriesSelected$(): Observable<string[]> {
		return this._countriesService.countries$.pipe(
			map((countries) =>
				countries.filter((c) => c.selected).map((c) => c.iso3166),
			),
		);
	}

	get prefersDark$(): Observable<boolean> {
		return fromEvent<MediaQueryListEvent>(
			this._windowRef.window.matchMedia('(prefers-color-scheme: dark)'),
			'change',
		).pipe(
			map((event) => event.matches),
			distinctUntilChanged(),
		);
	}

	ngOnInit(): void {
		this._subs.sink = this._countriesService.focus$.subscribe((country) => {
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

		this._subs.sink = this.prefersDark$.subscribe((prefersDark) => {
			this.map?.setStyle(
				prefersDark ? this.darkThemeUrl : this.lightThemeUrl,
			);
		});
	}

	ngOnDestroy(): void {
		this._subs.unsubscribe();
	}

	onMapLoad(map: Map): void {
		this.map = map;
	}
}
