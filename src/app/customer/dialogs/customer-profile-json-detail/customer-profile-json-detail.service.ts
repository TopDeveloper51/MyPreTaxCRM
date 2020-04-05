// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { APINAME } from '@app/customer/customer-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';
@Injectable({
  providedIn: 'root'
})
export class CustomerProfileJsonDetailService {

  constructor(private commonApiService: CommonApiService) { }

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used get customer document by id
* @memberof CustomerProfileJsonDetailComponent
*/

  public getCustomerDocumentByIdJSON(docId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ORDER_OVERVIEW_JSON, parameterObject: docId }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
