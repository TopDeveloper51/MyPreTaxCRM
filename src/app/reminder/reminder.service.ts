import { Injectable } from '@angular/core';
import { APINAME } from '@app/reminder/reminder.constants';
import { CommonApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor(private commonApiService: CommonApiService) { }

  getDataForBreakDetails(filterForBreakDetails) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_DATA_FOR_PENDING_REQUESTS, parameterObject: { 'date': filterForBreakDetails, 'status': 'pending' }, showLoading: true
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

  getDataForPendingApprovals(filterForPendingApprovals) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.GET_DATA_FOR_PENDING_APPROVALS, parameterObject: filterForPendingApprovals, showLoading: true
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

  attemptLater() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.SET_REMINDER_ATTEMPT, showLoading: true
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
