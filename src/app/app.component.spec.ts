import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents, MockModule } from 'ng-mocks';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MapModule } from './map/map.module';
import { MenuComponent } from './menu/menu.component';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				MockComponents(HeaderComponent, MenuComponent),
			],
			imports: [MockModule(MapModule)],
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
