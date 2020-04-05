import { Injectable } from '@angular/core';


// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable({
  providedIn: 'root'
})
export class CustomerReviewService {

  constructor(private commonApiService: CommonApiService) { }

  public getCustomerReview(id: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_DATA_OF_CUSTOMER_REVIEW, parameterObject: id }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
