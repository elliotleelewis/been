import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { CountriesService } from '../services/countries.service';

import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MenuComponent, MockComponent(HeaderComponent)],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [
				MockProvider(CountriesService, {
					regions$: of([]),
					addCountry: jest.fn(),
					removeCountry: jest.fn(),
				}),
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuComponent);
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
