import { Injectable } from '@angular/core';
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable({
  providedIn: 'root'
})
export class CustomerHistoryService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author shreya kanani
   * @param customerId 
   * @description call api for customer history 
   */
  public getCustomerHistoryData(customerId: any) {
    return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({
            apiName: APINAME.CUSTOMER_HISTORY,
            parameterObject: customerId
        }).then(response => {
            resolve(response);
        },
            error => {
                reject(error);
            }
        );
    });
}

}
