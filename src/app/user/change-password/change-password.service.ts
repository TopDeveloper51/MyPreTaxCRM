// External Imports
import { Injectable } from '@angular/core';

// Internal Imports
import { APINAME } from '@app/user/user.constants';
import { CommonApiService } from '@app/shared/services/common-api.service';


@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private commonAPI: CommonApiService) { }

  /**
   * Purpose is to Login User into the Application
   * @param email Email to Login
   * @param password User Password to Login
   */
  public changePassword(apiparams): any {
    return new Promise((resolve, reject) => {
      this.commonAPI
        .getPromiseResponse({
          apiName: APINAME.CHANGE_PASSWORD,
          parameterObject: {
            userName: apiparams.apiparams.userName,
            oldPassword: apiparams.apiparams.oldPassword,
            newPassword: apiparams.apiparams.newPassword
          },
          showLoading: true
        })
        .then(
          (response: any) => {
            if (response) {
              resolve(response);
            }
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
