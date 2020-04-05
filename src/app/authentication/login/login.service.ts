// External Imports
import { Injectable } from '@angular/core';

// Internal Imports
import { UserService } from '@app/shared/services/user.service';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { DataStoreService } from '@app/shared/services/data-store.service';
import { AuthenticationService } from '@app/authentication/authentication.service';

@Injectable({
  providedIn: null
})
export class LoginService {
  constructor(
    private userService: UserService,
    private commonAPI: CommonApiService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private dataStoreService: DataStoreService,
    private authService: AuthenticationService
  ) {}

  /**
   * Purpose is to Login User into the Application
   * @param email Email to Login
   * @param password User Password to Login
   */
  public doLogin({ username, password }): any {
    return new Promise((resolve, reject) => {
      this.commonAPI
        .getPromiseResponse({
          apiName: '/auth/login',
          methodType: 'post',
          parameterObject: { userName: username, password },
          showLoading: true
        })
        .then(
          (res: any) => {
            const userDetails = res ? res : {};
            this.authService.setUserData(userDetails, true);
            resolve(userDetails);
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
