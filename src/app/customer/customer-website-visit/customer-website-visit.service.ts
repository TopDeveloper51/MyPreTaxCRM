import { Injectable } from '@angular/core';

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable({
  providedIn: 'root'
})
export class CustomerWebsiteVisitService {

  constructor(private commonApiService: CommonApiService) { }
  public getWebsiteList(id: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_WEBSITE_VISIT_LIST_OF_CUSTOMER, parameterObject: id }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
}
}
