import { Injectable } from '@angular/core';

import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";
@Injectable({
  providedIn: 'root'
})
export class CustomerCardEditableService {

  constructor( private commonApiService: CommonApiService) { }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to check duplicate customer list
* @memberof CustomerCardEditableComponent
*/

  public getCheckDuplicateCustomerList(data: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CHECK_DUPLICATE, parameterObject: data, showLoading:true }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to enable conversation
* @memberof CustomerCardEditableComponent
*/
  public getEnableConversation(data: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.ENABLE_CONVERSION, parameterObject: data, showLoading:true }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to get allow access
* @memberof CustomerCardEditableComponent
*/
  public getAllowAccess(data: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.ALLOW_ACESSS_TO_TAXVISION, parameterObject: data, showLoading:true }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
* @author Manali Joshi
* @createdDate 13/01/2020
* @description this method is use to get allow access
* @memberof CustomerCardEditableComponent
*/
  public FirmSetupLogin(customerId: string, reason: string) {
    return new Promise((resolve, reject) => {
      // CRM api call to get the encrypted string to get csrf tocken for login request in tax application
      this.commonApiService.getPromiseResponse({ apiName: APINAME.FIRMSETUP_LOGIN, parameterObject: { customerId: customerId, reason: reason }, originKey: 'origin' })
        .then(response => {
          const encryptedString = response;
          // call taxapi to get xsrf token to pass it to taxapp
          this.taxLogout().then((result) => {
            this.getXSRFTokenFromTaxApp(encryptedString).then((xsrftoken) => {
              resolve(xsrftoken);
            }, (error) => {
              reject(error);
            });
          }, (error) => {
            reject(error);
          });
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @author Manali Joshi
   * @param encryptedData
   *        Holds encrypted data comes from login in to firm api response.
   * @description
   *        This function is used to call tax api to get xsrf token from taxapp to pass it to taxapp when redirecting.
   */
  public getXSRFTokenFromTaxApp(encryptedData: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_XSRF_FROM_TAX,
        parameterObject: { data: encryptedData },
        originKey: 'taxapi_url'
      }).then((result) => {
        resolve(result.xsrfToken);
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
  * @author Manali Joshi
  * @param {}
  * @description
  * This function is used to call tax api to logout existing logged in user
  */
  public taxLogout() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.TAX_LOGOUT,
        originKey: 'taxapi_url'
      }).then((result) => {
        resolve(true);
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
   * @author Manali Joshi
   * @param {}
   * @description
   * This function is used to call tax api to logout existing logged in user
   */
  public EnableFeeCollectionProgram(jsonDataObj: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.ENABLE_FEECOLLECTPROGRAM,
        parameterObject: jsonDataObj ,
        originKey: 'origin',
      }).then((result) => {
        resolve(true);
      }, (error) => {
        reject(error);
      });
    });
  }
}
