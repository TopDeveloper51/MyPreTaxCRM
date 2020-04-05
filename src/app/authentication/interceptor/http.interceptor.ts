import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';

import { RequestCacheService } from '@app/authentication/interceptor/requestCache.service';
import {
  LocalStorageUtilityService,
  SentryService,
  MessageService
} from '@app/shared/services';
import { AuthenticationService } from '@app/authentication/authentication.service';
import { environment } from '@environments/environment';

const TTL = null;

@Injectable({
  providedIn: 'root'
})
export class InterceptedHttp implements HttpInterceptor {
  public invalidCSRFAttempt = 0;
  public invalidCSRFErrorURL: string;

  constructor(
    private cache: RequestCacheService,
    private sentryService: SentryService,
    private messageService: MessageService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private injector: Injector
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if this is a login-request the header is
    // already set to x/www/formurl/encoded.
    // so if we already have a content-type, do not
    // set it, but if we don't have one, set it to
    // default --> json
    // enable cookies
    const isCached = req.headers.get('X-Cache');
    if (isCached !== null && isCached !== 'undefined' && isCached === 'true') {
      const cachedResponse = this.cache.get(req.url);
      return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
    } else {
      return this.sendRequest(req, next);
    }
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const showLoadingBar = req.headers.get('isShowLoading');

    const isWhiteListAPI = environment.whiteListAPIs.filter(
      url => req.url.indexOf(url) !== -1
    );
    if (isWhiteListAPI === undefined || isWhiteListAPI.length === 0) {
      req = req.clone({ withCredentials: true });
      if (!req.headers.has('Content-Type')) {
        req = req.clone({
          headers: req.headers.set('Content-Type', 'application/json')
        });
      }
      // if (!req.headers.has('referrer')) {
      //   req = req.clone({
      //     headers: req.headers.set('referrer', environment.host + '/')
      //   });
      // }

      if (this.localStorageUtilityService.getFromLocalStorage('xsrfToken')) {
        req = req.clone({
          headers: req.headers.set(
            'X-XSRF-TOKEN',
            this.localStorageUtilityService.getFromLocalStorage('xsrfToken')
          )
        });
      }

      if (this.localStorageUtilityService.getFromLocalStorage('resellerId')) {
        req = req.clone({
          headers: req.headers.set(
            'X-RId',
            this.localStorageUtilityService.getFromLocalStorage('resellerId')
          )
        });
      }

      if (this.localStorageUtilityService.getFromLocalStorage('taxYear')) {
        req = req.clone({
          headers: req.headers.set(
            'X-Taxyear',
            this.localStorageUtilityService.getFromLocalStorage('taxYear')
          )
        });
      }
      if (this.localStorageUtilityService.getFromLocalStorage('locationId')) {
        req = req.clone({
          headers: req.headers.set(
            'X-Location',
            this.localStorageUtilityService.getFromLocalStorage('locationId')
          )
        });
      }

      // req = req.clone({
      //   headers: req.headers.set('Authorization', 'contentmgmt')
      // });

      return next
        .handle(req)
        .do(
          res => {
            if (res instanceof HttpResponse) {
              this.cache.set(req.url, res, TTL);
              this.unwrapHttpValue(res);
            }
            return res;
          },
          err => {
            this.handleError(err);
            return throwError(err);
          }
        )
        .finally(() => { });
    } else {
      return next.handle(req).do(res => {
        return res;
      });
    }
  }

  unwrapHttpValue(response: any) {
    if (response != null) {
      // Store XSRF-Token
      if (response.headers.get('XSRF-TOKEN') != null  && response.url.indexOf(environment.taxapi_url) === -1) {
        this.localStorageUtilityService.addToLocalStorage(
          'xsrfToken',
          response.headers.get('XSRF-TOKEN')
        );
      }
    }

    if (response.status === 200 && response.body && response.body.code) {
      // If invalidCSRFAttempt is not 0 (Means we have hold original request) and url of hold vs this is same then reset attempt 0
      if (
        this.invalidCSRFAttempt > 0 &&
        this.invalidCSRFErrorURL &&
        response.url &&
        response.url.indexOf('/auth/session') < 0 &&
        this.invalidCSRFErrorURL === response.url
      ) {
        this.invalidCSRFAttempt = 0;
      }

      // Success mesassage
      this.messageService.showMessage('', '', 'DAPI_' + response.body.code);
    }
  }

  setInvaildCSRFAttempt(count: number, url: string) {
    this.invalidCSRFAttempt = count;
    this.invalidCSRFErrorURL = url;
  }

  getInvalidCSRFAttemptCount(): number {
    return this.invalidCSRFAttempt;
  }
  private handleError(rejection: any) {
    if (rejection instanceof HttpErrorResponse) {
      this.sentryService.moveErrorToSentry(JSON.stringify(rejection));
      // Store XSRF-Token
      if (rejection.headers.get('XSRF-TOKEN')) {
        this.localStorageUtilityService.addToLocalStorage(
          'xsrfToken',
          rejection.headers.get('XSRF-TOKEN')
        );
      }

      if (rejection.status === 503) {
        // message key need to be change as it will come from API it self
        this.messageService.showMessage(
          '',
          '',
          'DAPI_' + (rejection.error.code || rejection.status)
        );
      } else if (rejection.status === 400) {
        // message key need to be change as it will come from API it self
        this.messageService.showMessage(
          '',
          '',
          'DAPI_' + (rejection.error.code || rejection.status)
        );
      } else if (rejection.status === 401) {
        this.messageService.showMessage(
          '',
          '',
          'DAPI_' + (rejection.error.code || rejection.status)
        );
      } else if (rejection.status === 403) {
        if (rejection.error.code === 4006) {
          // Retry - Code
          // To Avoid circular dependecy
          const authService = this.injector.get(AuthenticationService);
          authService.createSession(false).then(
            success => { },
            error => {
              console.error(error);
            }
          );
        } else if (rejection.error.code === 4005) {
          // 4005 = Invalid CSRF
          // Check invalid CSRF attempt
          if (this.getInvalidCSRFAttemptCount() === 0) {
            // If Attempt is 0. Make make session request and on success of that session call re call error api with new token
            this.setInvaildCSRFAttempt(1, rejection.url);

            const authService = this.injector.get(AuthenticationService);

            authService.createSession(false).then(
              success => { },
              error => {
                console.error(error);
              }
            );
          } else {
            // This means we have tried this api one more time for invalid csrf token. So do not try more.
            // To Avoid circular dependecy
            const authService = this.injector.get(AuthenticationService);

            // Delete Token
            this.localStorageUtilityService.removeFromLocalStorage('xsrfToken');
            authService.setIsAuthenticated(false);
            // refresh page and redirect to login page
            location.pathname = '/login';
            window.location.reload();
          }
        } else if (rejection.error.code === 4004) {
          // 4004 = Unauthorized request
          // To Avoid circular dependecy
          const authService = this.injector.get(AuthenticationService);
          // Delete Token
          this.localStorageUtilityService.removeFromLocalStorage('xsrfToken');
          authService.setIsAuthenticated(false);
          // We have to wrap location change inside $evalAsync,so that the location changes properly and everything stays in sync
          location.pathname = '/login';
          window.location.reload();
        }
      }
    } else {
      this.sentryService.moveErrorToSentry(rejection.toString());
    }
  }
}
