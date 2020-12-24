import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MenuComponent],
			imports: [FormsModule],
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
});
