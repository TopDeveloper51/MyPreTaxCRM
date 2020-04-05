// External import
import { Injectable } from '@angular/core';

// Internal import
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/layout/layout.constants';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author Mansi makwana
   * @createdDate 15-11-2019
   * @description  This Function is used  to get checkIn checkOut status
   * @memberOf PredictiveDialerService
   */
  checkInOutStatus(checkInStatus) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.CHECK_IN_OUT_STATUS, parameterObject: { 'checkInStatus': checkInStatus }, showLoading: false
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

  updateTTLDoc() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.UPDATE_TTL_DOC, showLoading: false
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

  TimeAccountingReminder() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.TIME_ACCOUNTING_REMINDER_JOB, showLoading: false
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
