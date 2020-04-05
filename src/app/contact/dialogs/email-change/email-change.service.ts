// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/contact/contact-constants';

@Injectable()
export class EmailChangeService {

  constructor(private commonApiService: CommonApiService) { }
  /**
   * @author om kanada
   * change Email Address
   * @memberof EmailChangeService
   */
  public changeEmail(emailData: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.CHANGE_PASSWORD_DETAIL, parameterObject:  emailData , showLoading:true
      }).
        then((response) => {
          if (response) {
            resolve(response || []);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });

  }

  
}
