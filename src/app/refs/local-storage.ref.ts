import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class LocalStorageRef {
	get localStorage(): Storage {
		return localStorage;
	}
}
