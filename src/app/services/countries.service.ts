import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, type Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import data from '../data/countries.json';
import { regionalizer } from '../helpers';
import { type Country } from '../models/country';
import { type Region } from '../models/region';
import { LocalStorageRef } from '../refs/local-storage.ref';

@Injectable({
	providedIn: 'root',
})
export class CountriesService {
	private readonly localStorageRef = inject(LocalStorageRef);

	static readonly COUNTRIES_STORAGE_KEY = 'APP_COUNTRIES';

	private _countries$ = new BehaviorSubject<readonly string[]>(
		this.countries,
	);

	private _focus$ = new Subject<string>();

	get countries$(): Observable<readonly Country[]> {
		return this._countries$.pipe(
			map((countries) =>
				data.map((c) => ({
					...c,
					selected: countries.includes(c.iso3166),
				})),
			),
		);
	}

	get focus$(): Observable<string> {
		return this._focus$.asObservable();
	}

	get regions$(): Observable<readonly Region[]> {
		return this.countries$.pipe(
			map((countries) => regionalizer(countries)),
		);
	}

	private get countries(): readonly string[] {
		const item = this.localStorageRef.localStorage.getItem(
			CountriesService.COUNTRIES_STORAGE_KEY,
		);
		return item ? (JSON.parse(item) as string[]) : [];
	}

	private set countries(value: readonly string[]) {
		const item = JSON.stringify(value);
		this.localStorageRef.localStorage.setItem(
			CountriesService.COUNTRIES_STORAGE_KEY,
			item,
		);
		this._countries$.next(value);
	}

	addCountry(countryCode: string): void {
		const countries = [...this.countries];
		if (!countries.includes(countryCode)) {
			countries.push(countryCode);
			this._focus$.next(countryCode);
		}
		this.countries = countries;
	}

	removeCountry(countryCode: string): void {
		const countries = [...this.countries];
		const countryIndex = countries.indexOf(countryCode);
		if (countryIndex > -1) {
			countries.splice(countryIndex, 1);
		}
		this.countries = countries;
	}

	clearCountries(): void {
		this.countries = [];
	}
}
