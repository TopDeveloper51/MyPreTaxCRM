// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from "@app/shared/services";
import { APINAME } from "@app/customer-accounting/customer-accounting-constants";

@Injectable()

export class CustomerAccountingDetailService {

  constructor(private commonApiService: CommonApiService) { }
    public saveNewTransactionDetails(saveTansactionReqData) {
      return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_TRANSACTION_DETAIL, parameterObject: saveTansactionReqData }).then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
      });
    }

    public getCustomerTransactionDetailsById(id) {
      return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TRANSACTION_DOC, parameterObject: id }).then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
      });
    }

    public addChangeCustomerReference(changeCustomerData) {
      return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.ADD_CHANGE_CUSTOMER_REFERENCE, parameterObject: changeCustomerData }).then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
      });
    }
}
