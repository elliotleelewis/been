import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class WindowRef {
	get window(): Window {
		return window;
	}
}
