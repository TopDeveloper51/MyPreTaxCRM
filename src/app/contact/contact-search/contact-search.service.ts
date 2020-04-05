// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services/common-api.service';
import { APINAME } from '@app/contact/contact-constants';

@Injectable()
export class ContactSearchService {

  constructor(private commonApiService: CommonApiService) { }
  /**
   * @author om kanada
   * Call API to search Data
   * @param
   *  contactSearch details to search
   * @memberof ContactSearchService
   */
  public searchData(contactSearch: any, formData: any) {
    contactSearch.contactName = formData.contactName;
    contactSearch.isInvalidNumber = formData.isInvalidNumber;
    const formArray = [];
    if (formData.emailStatus && formData.emailStatus.length > 0) {
      contactSearch.emailStatusResult = formData.emailStatus;
      for (const item of formData.emailStatus) {
        formArray.push({ id: item });
      }
      contactSearch.emailStatus = formArray;
    }
    else{
      contactSearch.emailStatus = formData.emailStatus;
    }
    contactSearch.email = formData.email;
    // if (
    //   formData.telephone !== undefined &&
    //   formData.telephone !== "" &&
    //   formData.telephone !== null
    // ) {
    //   contactSearch.telephone = formData.telephone.replace(/[^\w]/gi, "").trim();
    // }else{
      contactSearch.telephone = formData.telephone;
  //  }
    contactSearch.isWrongNumber = formData.isWrongNumber;
    contactSearch.testCustomer = formData.testCustomer;
    contactSearch.unsubscribeEmail = formData.unsubscribeEmail;
    
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.POST_CONTACT_SEARCH, parameterObject: contactSearch }).then(
        (response) => {
          let availableContact;
          if (response) {
            availableContact = {
              data: response,
              total: response ? (response.length > 0 ? response[0].totalCount : 0) : 0
            };
          }
          resolve(availableContact);
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @author om kanada
   * to get Email status lookup data
   * @memberof ContactSearchService
   */
  public getEmailStatusLookup() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_EMAIL_STATUS_LOOKUP,isCachable:true, parameterObject: { isRequiredBlank: undefined } }).
        then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });

  }
}
