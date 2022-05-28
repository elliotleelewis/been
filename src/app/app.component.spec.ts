import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MenuComponent } from './menu/menu.component';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				MockComponents(MapComponent, MenuComponent),
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AppComponent);
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
