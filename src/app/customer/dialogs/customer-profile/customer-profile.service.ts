// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { APINAME } from '@app/customer/customer-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerProfileService {
  
  constructor(private commonApiService: CommonApiService) { }

  public customerLookup: any = {
    responsiblePesronList: [],
  };

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used get document by id 
* @memberof CustomerProfileComponent
*/
  public getDocumentById(docId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ORDER_OVERVIEW_DOC, parameterObject: docId }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used get customer profile lookup
* @memberof CustomerProfileComponent
*/
  public getLookupForResponsiblePersonList() {
    this.customerLookup = {};
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.CUSTOMER_PROFILE_LOOKUP,
          isCachable:true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              this.customerLookup.responsiblePesronList = response.responsiblePesronList;
              this.customerLookup.statusList = response.statusList;
              this.customerLookup.addOnAcctCategoryList = response.addOnAcctCategoryList;
              this.customerLookup.addOnAcctStatusList = response.addOnAcctStatusList;
              this.customerLookup.statusList.unshift({
                // group: "",
                id: "blank",
                name: "Blank",
              });
              this.customerLookup.responsiblePesronList.unshift({
                // group: "",
                id: "blank",
                name: "Blank",
              });
              resolve(this.customerLookup);
            } else {
              reject();
            }
          },
          error => {
            reject(error);
          }
        );
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used save customer profile  
* @memberof CustomerProfileComponent
*/
  public saveCustomerProfile(docId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_ORDER_OVERVIEW, parameterObject: docId }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

}
