// External imports
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
// Internal imports
import { UserService } from '@app/shared/services/user.service';
import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  private defaultRouteUnAuthenticated = '/login';
  private defaultRouteAuthenticated = '/activity';

  constructor(private router: Router, private userService: UserService, @Inject(PLATFORM_ID) protected platformId: object, private authenticationService: AuthenticationService) { }

  canActivate(route: any, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let isCallOverviewUser;
    const currentAccess = route.data.access;
    const routeState = '_routerState';
    let currentRoutePath = route[routeState].url
      ? route[routeState].url
      : undefined;
    // Evaluationg the route base on language;
    const forceRedirect = false;
    let isAllowAccess = true;

    // Evaluationg the route access
    if (currentRoutePath === '/login') {
      if (this.userService.isAuthenticated) {
        if (!forceRedirect) {
          this.router.navigateByUrl(this.defaultRouteAuthenticated);
        } else {
          currentRoutePath = this.defaultRouteUnAuthenticated;
        }
      } else {
        isAllowAccess = true;
      }
    } else if (currentRoutePath && currentAccess.requiredAuthentication) {
     
       // to disabled url which is newly implemented in beta crm
       const hideLiveCRMMenuList: any = this.userService.hideLiveCRMMenu();     
       if (hideLiveCRMMenuList && hideLiveCRMMenuList.length > 0) {
           if (hideLiveCRMMenuList.includes(currentRoutePath)) {
               this.router.navigate([this.authenticationService.lastUserPath]);
               return false;
           }
       }
      if (this.userService.isAuthenticated) {
        // isAllowAccess = true;
        const isManagement = this.userService.getProperty('isManagementUser');
        const isMarketingAnalystUser = this.userService.getProperty('isMarketingAnalystUser');
        isCallOverviewUser = this.userService.getProperty('isCallOverviewUser');
        const resellerName = this.userService.getProperty('resellerName');
        const isMergeCustomer = this.userService.getProperty('isMergeCustomer');
        const IsAssessmentAdmin = this.userService.getProperty("assessmentAdminUser");
        if (!currentAccess.betaOnly) {
          if ((currentRoutePath == '/marketAnalysis' || currentRoutePath == '/templateList') && !isManagement && isMarketingAnalystUser && (resellerName == 'myTAXPrepOffice' || resellerName == 'TaxVisionCloud')) {
            this.authenticationService.lastUserPath = currentRoutePath;
            isAllowAccess = true;
          } else if (isCallOverviewUser) {
            if (currentRoutePath === '/dialer/calls-details' || currentRoutePath === '/ChangePassword' || currentRoutePath === '/logout') {
              this.authenticationService.lastUserPath = currentRoutePath;
              isAllowAccess = true;
            } else {
              this.router.navigate(['dialer', 'call-details']);
              isAllowAccess = false;
            }
          } else if (currentRoutePath === '/mergeCustomer') {
            if (isMergeCustomer === true) {
              this.authenticationService.lastUserPath = currentRoutePath;
              isAllowAccess = true;
            } else {
              isAllowAccess = false;
            }
          } else if (currentAccess.IsAssessmentAdmin !== undefined && currentAccess.IsAssessmentAdmin === true) {
            if (IsAssessmentAdmin === true) {
              this.authenticationService.lastUserPath = currentRoutePath;
              isAllowAccess = true;
            } else {
              isAllowAccess = false;
            }
          } else if (currentAccess.onlyForManagementUser || (currentAccess.onlyForAllowedResellers && currentAccess.onlyForAllowedResellers.length > 0)) {
            let isAllowedReseller;
            const allowedResellers = currentAccess.onlyForAllowedResellers;
            if (allowedResellers && allowedResellers.length > 0) {
              if (allowedResellers.indexOf(resellerName) > -1) {
                isAllowedReseller = true;
              } else {
                isAllowedReseller = false;
              }
            }
            if (isManagement && isAllowedReseller) {
              this.authenticationService.lastUserPath = currentRoutePath;
              isAllowAccess = true;
            } else if (!isManagement && !isAllowedReseller) {
              if (this.authenticationService.lastUserPath === '') {
                this.router.navigateByUrl(this.authenticationService.lastUserPath);
              } else {
                isAllowAccess = false;
              }
            } else if (!isManagement && isAllowedReseller) {
              if ((currentAccess.onlyForManagementUser !== undefined && currentAccess.onlyForManagementUser === true)) {
                if (this.authenticationService.lastUserPath === '') {
                  this.router.navigateByUrl(this.authenticationService.lastUserPath);
                } else {
                  return false;
                }
              } else {
                this.authenticationService.lastUserPath = currentRoutePath;
                isAllowAccess = true;
              }
            } else if (isManagement && !isAllowedReseller) {
              if ((currentAccess.onlyForAllowedResellers !== undefined && currentAccess.onlyForAllowedResellers.length > 0)) {
                if (this.authenticationService.lastUserPath === '') {
                  this.router.navigateByUrl(this.authenticationService.lastUserPath);
                } else {
                  isAllowAccess = false;
                }
              } else {
                this.authenticationService.lastUserPath = currentRoutePath;
                isAllowAccess = true;
              }
            }
          } else {
            this.authenticationService.lastUserPath = currentRoutePath;
            isAllowAccess = true;
          }
        } else {
          this.router.navigateByUrl(this.authenticationService.lastUserPath);
        }
      } else {
        if (!forceRedirect) {
          this.router.navigateByUrl(this.defaultRouteUnAuthenticated);
        } else {
          currentRoutePath = this.defaultRouteUnAuthenticated;
        }
      }
    } else if (!currentAccess || !currentAccess.requiredAuthentication) {
      isAllowAccess = true;
    } else {
      isAllowAccess = true;
    }

    // Redirection
    const urlToRedirect = `${environment.host}/#${currentRoutePath}`;
    if (!forceRedirect) {
      return isAllowAccess;
    } else {
      window.location.href = urlToRedirect;
    }
  }
}
