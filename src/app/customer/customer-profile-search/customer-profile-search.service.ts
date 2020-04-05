import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { CommonApiService, LocalStorageUtilityService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";
import { resolve, reject } from 'q';

@Injectable({
  providedIn: 'root'
})
export class CustomerProfileSearchService {

  constructor(private commonApiService: CommonApiService, private localStorageUtilityService: LocalStorageUtilityService) { }

  customerProfileSearch(searchDocument) {
    return new Promise((resolve, reject) => {
      for (const key in searchDocument) {
        if (searchDocument[key] || (searchDocument[key] === false && key !== 'testCustomer') || searchDocument[key] === 0) {
          if (typeof searchDocument[key] === 'string') {
            searchDocument[key] = searchDocument[key].toString().trim();
            if (key === 'customerNumber') {
              if (searchDocument[key] != null && searchDocument[key] !== undefined && searchDocument[key] !== '') {
                searchDocument[key] = searchDocument[key].toString().replace(/#/g, '');
              }
            } else if (key === 'FOIAReturnFrom' || key === 'FOIAReturnTo') {
              searchDocument[key] = parseInt(searchDocument[key].toString().trim(), 0);
            } else if (key === 'feedbackDateFrom') {
              const tmpDate = new Date(searchDocument[key]);
              searchDocument[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            } else if (key === 'feedbackDateTo') {
              const tmpDate = new Date(searchDocument[key]);
              searchDocument[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            }
          } else if (typeof searchDocument[key] === 'number') {
            searchDocument[key] = parseInt(searchDocument[key].toString().trim(), 0);
          }
        } else {
          delete searchDocument[key];
        }
      }
      this.localStorageUtilityService.addToLocalStorage('customerProfileSearch', searchDocument);
      // searchDocument['sortDirection'] = "asc";
      // searchDocument['sortExpression'] = "customerName";
      // searchDocument['pageNo'] = 1;
      // searchDocument['pageSize'] = 1000;
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ALL_ORDER_DOCS, parameterObject: searchDocument }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });

  }

  // check the givent date is in day light saving on EST zone  or not
  isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  public downloadSetupReport() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getObservableResponse({ apiName: APINAME.GET_SETUP_REPORT }).subscribe(result => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    });
  }

  public downloadFullExcel(currentYear: boolean) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getObservableResponse({
        apiName: APINAME.GET_FULL_RENEWAL_EXCEL_DATA,
        parameterObject: { 'currentYear': currentYear }
      }).subscribe(result => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    });
  }

  downloadExcel(searchDocument) {
    return new Promise((resolve, reject) => {
      for (const key in searchDocument) {
        if (searchDocument[key] || (searchDocument[key] === false && key !== 'testCustomer') || searchDocument[key] === 0) {
          if (typeof searchDocument[key] === 'string') {
            searchDocument[key] = searchDocument[key].toString().trim();
            if (key === 'customerNumber') {
              if (searchDocument[key] != null && searchDocument[key] !== undefined && searchDocument[key] !== '') {
                searchDocument[key] = searchDocument[key].toString().replace(/#/g, '');
              }
            } else if (key === 'FOIAReturnFrom' || key === 'FOIAReturnTo') {
              searchDocument[key] = parseInt(searchDocument[key].toString().trim(), 0);
            } else if (key === 'feedbackDateFrom') {
              const tmpDate = new Date(searchDocument[key]);
              searchDocument[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            } else if (key === 'feedbackDateTo') {
              const tmpDate = new Date(searchDocument[key]);
              searchDocument[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            }
          } else if (typeof searchDocument[key] === 'number') {
            searchDocument[key] = parseInt(searchDocument[key].toString().trim(), 0);
          }
        } else {
          delete searchDocument[key];
        }
      }
      this.localStorageUtilityService.addToLocalStorage('customerProfileSearch', searchDocument);
      searchDocument['sortDirection'] = "asc";
      searchDocument['sortExpression'] = "customerName";
      searchDocument['pageNo'] = 1;
      searchDocument['pageSize'] = 1000;
      this.commonApiService.getObservableResponse({ apiName: APINAME.GET_RENEWAL_EXCEL_DATA, parameterObject: searchDocument }).subscribe(result => {
        resolve(result);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getLookupForResponsiblePersonList() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.CUSTOMER_PROFILE_LOOKUP,
          isCachable: true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            const lookupObj: any = {};
            if (response) {
              // responsible person list.
              if (response !== undefined && response.responsiblePesronList !== undefined) {
                lookupObj.responsiblePersonList = response.responsiblePesronList;
              } else {
                lookupObj.responsiblePersonList = [];
              }

              // status list.
              if (response !== undefined && response.statusList !== undefined) {
                lookupObj.statusList = response.statusList;
              } else {
                lookupObj.statusList = [];
              }

              // add on category list.
              if (response !== undefined && response.addOnAcctCategoryList !== undefined) {
                lookupObj.addOnAcctCategoryList = response.addOnAcctCategoryList;
              } else {
                lookupObj.addOnAcctCategoryList = [];
              }

              // add on status list.
              if (response !== undefined && response.addOnAcctStatusList !== undefined) {
                lookupObj.addOnAcctStatusList = response.addOnAcctStatusList;
              } else {
                lookupObj.addOnAcctStatusList = [];
              }
              // reseller list.
              if (response !== undefined && response.resellerList !== undefined) {
                lookupObj.resellerLookup = response.resellerList;
              } else {
                lookupObj.resellerLookup = [];
              }
              // state list.
              if (response !== undefined && response.stateList !== undefined) {
                lookupObj.stateLookup = [];
                for (const obj of response.stateList) {
                  lookupObj.stateLookup.push({ id: obj.value, name: obj.text })
                }
              } else {
                lookupObj.stateLookup = [];
              }
              // sales process status lookup.
              if (response !== undefined && response.salesProcessStatusList !== undefined) {
                lookupObj.salesProcessStatusLookup = [];
                for (const obj of response.salesProcessStatusList) {
                  lookupObj.salesProcessStatusLookup.push({ id: obj.id, name: obj.name })
                }
              } else {
                lookupObj.salesProcessStatusLookup = [];
              }
              // sales type list.
              if (response !== undefined && response.salesTypeList !== undefined) {
                lookupObj.salesTypeList = response.salesTypeList;
              } else {
                lookupObj.salesTypeList = [];
              }
              // package lookup.
              if (response !== undefined && response.plans !== undefined) {
                lookupObj.packageLookup = [];
                for (const obj of response.plans) {
                  lookupObj.packageLookup.push({ id: obj.shortName, name: obj.displayText })
                }
              } else {
                lookupObj.packageLookup = [];
              }
              // platfrom list.
              if (response !== undefined && response.platformList !== undefined) {
                lookupObj.platformList = response.platformList;
              } else {
                lookupObj.platformList = [];
              }
              resolve(lookupObj);
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

}
