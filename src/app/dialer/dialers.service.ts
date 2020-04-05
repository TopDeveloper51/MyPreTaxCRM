import { Injectable, EventEmitter } from '@angular/core';
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/dialer/dialer-constants';

@Injectable({
  providedIn: 'root'
})
export class DialersService {

  private refreshCallsData: EventEmitter<any> = new EventEmitter();
  private refreshStartEvent: EventEmitter<any> = new EventEmitter();
  constructor(private commonApiService: CommonApiService) { }


  public emitRefreshEvent(data: any) {
    this.refreshCallsData.emit(data);
  }

  public getRefreshEmitter() {
    return this.refreshCallsData;
  }

  public emitRefreshStopEvent(data: any) {
    this.refreshStartEvent.emit(data);
  }

  public getRefreshStopEmitter() {
    return this.refreshStartEvent;
  }

  /**
   * @author om kanada
   * @createdDate 6/1/2020
   * @description  This Function is used  to get Call notification.
   * @memberOf LayoutService
   */
  getCallNotification(userId: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse(
        {
          apiName: APINAME.GET_CALL_NOTIFICATIONS,
          parameterObject: { 'userId': userId }, originKey: 'websocket_url', showLoading: false
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

  getActivityId(data: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_ID, parameterObject: data, showLoading: false }).
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

  getAllPlivoUserOnline() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ALL_PLIVO_USER_ONLINE, originKey: 'websocket_url', showLoading: false }).
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
  deleteCalls(callId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.DELETE_CALL, parameterObject:
          { callId: callId },
        originKey: 'websocket_url',
        showLoading: false
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
  saveCallOverviewRefreshInterval(refreshInterval: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({
        apiName: APINAME.SAVE_CALL_OVERVIEW_REFRESH_INTERBAL,
        parameterObject: { 'callOverviewScreenRefreshInterval': parseInt(refreshInterval, 0) }, showLoading: false
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

  getCallOverviewRefreshInterval() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CALL_OVERVIEW_REFRESH_INTERBAL, showLoading: false }).
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
