// External import
import { Injectable } from '@angular/core';

// Internal import
import { CommonApiService } from '@app/shared/services/common-api.service';
import { APINAME } from '@app/predictive-dialer/predictive-dialer-constants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PredictiveDialerService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author Mansi makwana
   * @createdDate 15-11-2019
   * @description  This Function is used  to get Predictive dialer list lookup
   * @memberOf PredictiveDialerService
   */
  getDialerListLookup(paramObj) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_PD_STATISTICS, parameterObject: paramObj
      }).
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

  public searchSession() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SEARCH_SESSION, parameterObject: {} }).then((response) => {
        if (response) { resolve(response); }
        else { reject(); }
      }, (error) => {
        reject(error)
      });
    });
  }

  public getAppointmentByAgentId(agentId: any, showLoading?: Boolean) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_APPOINTMENT, parameterObject: agentId, showLoading: false
      }).
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

  public getLookupForbankListData(params: any, showLoading?: Boolean) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_LOOKUP_FOR_BANKLIST, isCachable: true, parameterObject: params, showLoading: false
      }).
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

  getDialerLookup(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_DIALER_LIST_LOOKUP, parameterObject: {} })
        .then(response => {
          const responseSorted = _.sortBy(response, (o) => { return o.name.toLowerCase(); });
          resolve(responseSorted);
        }, error => {
          reject(error);
        });
    });
  }

  public getLookupForTaxSoftwareList(params: any, showLoading?: Boolean) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_LOOKUP_FOR_TAXSOFTWARE_LIST, isCachable: true, parameterObject: params, showLoading: false
      }).
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

  public AddUpdateRequestLog(params: any, showLoading?: Boolean) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.ADD_UPDATE_REQUEST_LOGS, parameterObject: params, showLoading: false
      }).
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
