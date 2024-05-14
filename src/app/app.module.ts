import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MAPBOX_API_KEY, NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { ENVIRONMENT } from '../environments/environment';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './map/map.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
	declarations: [AppComponent, HeaderComponent, MapComponent, MenuComponent],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		NgxMapboxGLModule,
	],
	providers: [
		{
			provide: MAPBOX_API_KEY,
			useValue: ENVIRONMENT.apiKeyMapbox,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
