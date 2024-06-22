import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MAPBOX_API_KEY, NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { ENVIRONMENT } from '../../environments/environment';

import { MapComponent } from './map.component';

@NgModule({
	declarations: [MapComponent],
	imports: [BrowserModule, NgxMapboxGLModule],
	exports: [MapComponent],
	providers: [
		{
			provide: MAPBOX_API_KEY,
			useValue: ENVIRONMENT.apiKeyMapbox,
		},
	],
})
export class MapModule {}
