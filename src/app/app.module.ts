import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MAPBOX_API_KEY, NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		NgxMapboxGLModule,
	],
	providers: [
		{
			provide: MAPBOX_API_KEY,
			useValue: environment.apiKeyMapbox,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
