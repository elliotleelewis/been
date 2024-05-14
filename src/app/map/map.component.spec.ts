import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MockComponent, MockModule, MockProvider } from 'ng-mocks';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { NEVER, of } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { CountriesService } from '../services/countries.service';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MapComponent, MockComponent(HeaderComponent)],
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
