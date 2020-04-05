// External imports
import { Injectable } from "@angular/core";

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable()
export class CustomerContactService {

  constructor(private commonApiService: CommonApiService) { }

    public getContactPersonList(id: string) {
      return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CONTACT_PERSON_LIST, parameterObject: id, showLoading: true }).then((response) => {
          resolve(response);
        }, (error) => {
          reject(error);
        });
      });
    }
    
    public deleteContactDetail(deleteContact) {
      return new Promise((resolve, reject) => {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_CONTACT_DETAIL, parameterObject: deleteContact, showLoading: true }).then((response) => {
          resolve(response);
        }, (error) => {
          reject(error);
        });
      });
  }
}
