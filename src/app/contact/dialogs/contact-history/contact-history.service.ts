// External imports
import { Injectable } from '@angular/core';

// Internal imports
import { APINAME } from '@app/contact/contact-constants';
import { CommonApiService } from '@app/shared/services';


@Injectable()
export class ContactHistoryService {
  constructor(private commonApiService: CommonApiService) { }

  public getContactHistory(details:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CONTACT_HISTORY, parameterObject: details }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
