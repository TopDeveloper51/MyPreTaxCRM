import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationService } from '@app/authentication/authentication.service';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { LayoutModule } from '@app/layout/layout.module';
import { ErrorsHandler, InterceptedHttp } from '@app/authentication/interceptor';
import * as Raven from 'raven-js';
import { environment } from '@environments/environment';
import { LoaderComponent } from '@app/shared/loader/loader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WindowModule } from '@progress/kendo-angular-dialog';
import { ServiceWorkerModule } from '@angular/service-worker';
// Installing Sentry if it is not a local enviroment
if (environment.platform !== 'local') {
  Raven.config(environment.sentry_project_url, { release: environment.sentry_project_token }).install();
}


// AoT requires an exported function for factories
export function createSessionServiceFactory(authService: AuthenticationService) {
  return () => authService.createSession(true);
}


@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
  ],
  imports: [
    HttpClientModule,
    LayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    WindowModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorsHandler,
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptedHttp,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: createSessionServiceFactory,
      deps: [AuthenticationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
