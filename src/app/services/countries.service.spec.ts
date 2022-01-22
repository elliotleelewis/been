import { TestBed } from '@angular/core/testing';
import { MockProvider, MockService } from 'ng-mocks';

import { LocalStorageRef } from '../refs/local-storage.ref';

import { CountriesService } from './countries.service';

describe('CountriesService', () => {
	let service: CountriesService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MockProvider(LocalStorageRef, {
					localStorage: MockService(Storage, {
						getItem: () => '[]',
					}),
				}),
			],
		});
		service = TestBed.inject(CountriesService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
