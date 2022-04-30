import { HttpClientModule } from '@angular/common/http';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ElementComponent } from './element/element.component';
import { AccommodationService } from './services/accommodations.service';
import { DistancePipe } from './services/types';



@NgModule({
  declarations: [
    AppComponent,
    ElementComponent,
    DistancePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // MdbPopoverModule,
    // BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [AccommodationService],
  bootstrap: [environment.element ? [] : AppComponent],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap { 
  constructor(private injector: Injector) {}
  ngDoBootstrap(appRef: ApplicationRef): void {
    const el = createCustomElement(AppComponent, {
      injector: this.injector
    });
    customElements.define('hotel-picker', el)
  }
}


