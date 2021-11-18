import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import data from '../data/countries.json';
import { regionalizer } from '../helpers';
import { Country } from '../models/country';
import { Region } from '../models/region';
import { LocalStorageRef } from '../refs/local-storage.ref';

@Injectable({
	providedIn: 'root',
})
export class CountriesService {
	static readonly COUNTRIES_STORAGE_KEY = 'APP_COUNTRIES';

	private _countries$ = new BehaviorSubject<string[]>(this.countries);

	constructor(private localStorageRef: LocalStorageRef) {}

	get countries$(): Observable<Country[]> {
		return this._countries$.pipe(
			map((countries) =>
				data.map((c) => ({
					...c,
					selected: countries.indexOf(c.iso3166) >= 0,
				})),
			),
		);
	}

	get regions$(): Observable<Region[]> {
		return this.countries$.pipe(
			map((countries) => regionalizer(countries)),
		);
	}

	private get countries(): string[] {
		const item = this.localStorageRef.localStorage.getItem(
			CountriesService.COUNTRIES_STORAGE_KEY,
		);
		return (JSON.parse(String(item)) as string[]) ?? [];
	}

	private set countries(value: string[]) {
		const item = JSON.stringify(value);
		this.localStorageRef.localStorage.setItem(
			CountriesService.COUNTRIES_STORAGE_KEY,
			item,
		);
		this._countries$.next(value);
	}

	addCountry(countryCode: string): void {
		const countries = this.countries;
		if (!countries.includes(countryCode)) {
			countries.push(countryCode);
		}
		this.countries = countries;
	}

	removeCountry(countryCode: string): void {
		const countries = this.countries;
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
