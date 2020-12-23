import { Component } from '@angular/core';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
})
export class MapComponent {
	minZoom = 1;

	filter = ['in', 'iso_3166_1', 'US'];
}
