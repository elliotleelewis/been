import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		NgxMapboxGLModule.withConfig({
			accessToken: environment.apiKeyMapbox,
		}),
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
