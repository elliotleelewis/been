import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
	@Input()
	show: 'mobile' | 'tablet' = 'mobile';

	get showMobile(): boolean {
		return this.show === 'mobile';
	}

	get showTablet(): boolean {
		return this.show === 'tablet';
	}
}
