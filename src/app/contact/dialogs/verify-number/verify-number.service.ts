// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/contact/contact-constants';

@Injectable()
export class VerifyNumberService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author om kanada
   * Verify Number
   * @memberof VerifyNumberService
   */
  public verifyNumber(codeObj: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.VERIFY_NUMBER, parameterObject: codeObj 
      }).
        then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });

  }
}


