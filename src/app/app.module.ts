import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MapModule } from './map/map.module';
import { MenuComponent } from './menu/menu.component';

@NgModule({
	declarations: [AppComponent, HeaderComponent, MenuComponent],
	imports: [BrowserModule, FormsModule, MapModule, ReactiveFormsModule],
	bootstrap: [AppComponent],
})
export class AppModule {}
