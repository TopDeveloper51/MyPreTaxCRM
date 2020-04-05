import { Injectable } from '@angular/core';
import { CommonApiService } from '@app/shared/services';
import * as moment from 'moment';
import { APINAME } from '@app/predictive-dialer/predictive-dialer-constants';
import * as _ from 'lodash';


@Injectable()
export class PredictiveDialerManageService {

  constructor(private _commonAPI: CommonApiService) { }

  // get dialerlist
  public getDialerList(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = { date: moment().format('YYYYMMDD') };
      this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_DIALER_LIST, parameterObject: data }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });

  }

  /**
   * to call api for Statistics get of PD session
   */
  public getPDSessionStatistics(openIndex): Promise<any> {
    return new Promise((resolve, reject) => {
      this._commonAPI.getPromiseResponse({
        apiName: APINAME.GET_PDSESSION_STATISTICS,
        parameterObject: { id: openIndex }, showLoading: false
      }).then((response) => {
        resolve(response);
      }, error => {
        reject(error);
      });
    });
  }

  // getDialerLookup(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_DIALER_LIST_LOOKUP, parameterObject: {} })
  //       .then(response => {
  //         const responseSorted = _.sortBy(response, (o) => { return o.name.toLowerCase(); });
  //         resolve(responseSorted);
  //       }, error => {
  //         reject(error);
  //       });
  //   });
  // }


  getPDUserData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_DIALER_USER_LIST, parameterObject: {} })
        .then(response => {
          for (const obj of response) {
            obj.agents = _.sortBy(obj.agents, (t) => { return t.name });
          }
          resolve(response);
        }, error => {
          console.log(error);
        });
    });
  }
}
