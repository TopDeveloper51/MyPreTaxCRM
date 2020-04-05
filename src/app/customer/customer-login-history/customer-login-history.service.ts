// External imports
import { Injectable } from "@angular/core";

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable()
export class CustomerLoginHistoryService {

    constructor(private commonApiService: CommonApiService) { }

    public getCustomerLoginHistory(id: string) {
      return new Promise((resolve, reject) => {
          this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOGIN_HISTORY, parameterObject: id }).then((response) => {
           resolve(response);
          }, (error) => {
            reject(error);
        });
      });
    }
}
