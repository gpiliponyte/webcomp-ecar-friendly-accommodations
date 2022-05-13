import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { FetchDataService } from './services/fetch-data.service';
import { DistancePipe, TranslatePropertyPipe } from './util/types';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DistancePipe,
    TranslatePropertyPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  providers: [FetchDataService],
  bootstrap: [environment.element ? [] : AppComponent],
  entryComponents: [AppComponent],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(appRef: ApplicationRef): void {
    const el = createCustomElement(AppComponent, {
      injector: this.injector,
    });
    customElements.define('webcomp-ecar-friendly-accommodations', el);
  }
}
