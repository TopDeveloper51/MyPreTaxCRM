import { Injectable } from '@angular/core';
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";
@Injectable({
  providedIn: 'root'
})
export class CustomerAddressService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author shreya kanani
   * @param customerId 
   * @description call api for customer address info
   */
  public getCustomerAddressInfo(customerId: any) {
    return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({
            apiName: APINAME.CUSTOMER_ADDRESS_INFO,
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
