import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MockModule, MockProvider } from 'ng-mocks';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { NEVER, of } from 'rxjs';

import { CountriesService } from '../services/countries.service';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MapComponent],
			imports: [MockModule(NgxMapboxGLModule)],
			providers: [
				MockProvider(CountriesService, {
					countries$: of([]),
					focus$: NEVER,
				}),
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render', () => {
		expect(fixture).toMatchSnapshot();
	});
});
