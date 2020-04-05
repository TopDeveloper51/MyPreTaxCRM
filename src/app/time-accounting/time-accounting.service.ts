// External import
import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

// Internal import
import { CommonApiService } from '@app/shared/services/common-api.service';
import { APINAME } from '@app/time-accounting/time-accounting-constants';
import { useAnimation } from '@angular/animations';

@Injectable()

export class TimeAccountingService {

  public averageCouters: any = { 'totalTimePresent': 0, 'totalBreakTime': 0, 'totalCallTime': 0 };

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription getting the lookup values for responsible person's dropdown from the server api
   * @memberOf CheckinoutHistoryUserComponent
   */
  public getLookupForOrder() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_ORDER_SEARCH, showLoading: true }).
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

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription to get chekIn status
   * @memberOf CheckinoutHistoryUserComponent
   */
  public getCheckInStatus(searchObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CHECKIN_STATUS, parameterObject: searchObject, showLoading: true, }).
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

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription Function call For search Data As per Customer Search
   * @memberOf CheckinoutHistoryUserComponent
   */
  public getDialyTimeUsage(searchDaily) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.DAILY_TIME_USAGE_OVERVIEW_PER_USER, parameterObject: searchDaily, showLoading: false, }).
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

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription to verify check in-out records
   * @memberOf CheckinoutHistoryUserComponent
   */
  public verifyCheckInOutRecords(json) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.VERIFY_CHECK_IN_OUT_RECORDS, parameterObject: json, showLoading: true, }).
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

  /**
   * @author Mansi Makwana
   * @createdDate 04/03/2020
   * @discription to delete check in out details
   * @memberOf CheckinoutHistoryUserComponent
   */
  public deleteCheckInOutDetail(json) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_CHECK_IN_OUT_DETAIL, parameterObject: json, showLoading: true, }).
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

  /**
  * @author shreya kanani
  * @createdDate 12/03/2020
  * @description save check in status
  */
  public saveCheckInStatus(data) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_CHECK_IN_STATUS, parameterObject: data, showLoading: true, }).
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

  /**
   * @author shreya kanani
   * @createdDate 12/03/2020
   * @description call api to get data of checkIn/checkOut
   */
  public getTimeAcctountingReports(data) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TIME_ACCOUNTING_REPORTS, parameterObject: data, showLoading: true, }).
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

  public getLookupForTimeAccounting() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_TIMEACCOUNTING, showLoading: true }).
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


  public getDTUData(searchData, options, mode) {
    return new Promise((resolve, reject) => {
      let userIds = [];
      if(mode == 'user'){
        userIds.push({'id' : searchData.userId})
      }else{
      for (let obj of searchData.userId) {
        userIds.push({ 'id': obj });
      }
    }
     searchData.userId = userIds
      this.commonApiService.getPromiseResponse({ apiName: APINAME.DAILY_TIME_USAGE_OVERVIEW_PER_USER, parameterObject: searchData })
        .then((response) => {
          if (mode == 'user') {
            options.data = [];
            let dataArray = [];
            for (const useDatas of response) {
              const op = JSON.parse(JSON.stringify(options));
              const diff = moment(useDatas.ED, 'MM/DD/YYYY').diff(moment(useDatas.SD, 'MM/DD/YYYY'), 'days') + 1;
              const WData = [];
              for (let i = 0; i < diff; i++) {
                const DateForFound = moment(useDatas.SD, 'MM/DD/YYYY').add(i, 'days');
                const dateFound = useDatas.WDATA.find(o => moment(o.DT, 'MM/DD/YYYY').diff(DateForFound, 'days') === 0);
                if (dateFound === undefined) {
                  WData.push({ 'DT': moment(DateForFound).format('MM/DD/YYYY'), 'timingData': [] });
                } else {
                  WData.push(dateFound);
                }
              }

              this.setClass(WData, 'totalTimePresent', 'desc', 'isSownTopByPresent');
              this.setClass(WData, 'totalBreakTime', 'asc', 'isSownTopByBreak');
              this.setClass(WData, 'totalCallTime', 'desc', 'isSownTopByNet');
              this.calculateAverage(WData, op);
              op.data = WData;
              if (op.data !== undefined && op.data.length > 0) {
                for (const userCallData of op.data) {
                  userCallData.totalTimePresent = this.hhmmss(userCallData.totalTimePresent);
                  userCallData.totalBreakTime = this.hhmmss(userCallData.totalBreakTime);
                  userCallData.totalCallTime = this.hhmmss(userCallData.totalCallTime);
                  userCallData.noOfBreaks = userCallData.noOfBreaks !== undefined ? userCallData.noOfBreaks : '';
                }
              }
              op.data = _.sortBy(op.data, function (op) { return new Date(op.DT); });
              op.MinRange = useDatas.SD;
              op.chart.YDateStartLabel = useDatas.SD;
              op.MaxRange = useDatas.ED;
              dataArray.push(op);
            }

            if (dataArray !== undefined && dataArray.length > 0) {
              for (const optionsArrays of dataArray) {
                for (const obj of optionsArrays.data) {
                  if (obj.timingData !== undefined && obj.timingData.length > 0) {
                    for (const times of obj.timingData) {
                      times.SEC = (times.SEC / 60).toFixed(0);
                    }
                  }
                }
              }
            }


            if (dataArray) {
              resolve(dataArray);
            } else {
              reject();
            }

          } else {

            this.setClass(response[0].WDATA, 'totalTimePresent', 'desc', 'isSownTopByPresent');
            this.setClass(response[0].WDATA, 'totalBreakTime', 'asc', 'isSownTopByBreak');
            this.setClass(response[0].WDATA, 'totalCallTime', 'desc', 'isSownTopByNet');
            this.calculateAverage(response[0].WDATA, options);
            // this.minBreakPeriod = response[0].minBreakPeriod;
            options.data = response[0].WDATA;
            if (options.data !== undefined && options.data.length > 0) {
              for (const userCallData of options.data) {
                userCallData.totalTimePresent = this.hhmmss(userCallData.totalTimePresent);
                userCallData.totalBreakTime = this.hhmmss(userCallData.totalBreakTime);
                userCallData.totalCallTime = this.hhmmss(userCallData.totalCallTime);
                userCallData.noOfBreaks = userCallData.noOfBreaks !== undefined ? userCallData.noOfBreaks : '';
              }
            }
            options.data = _.orderBy(options.data, [user => user.UNAME !== undefined ? user.UNAME.toLowerCase() : user.UNAME], ['asc']);
            for (const obj of options.data) {
              if (obj.timingData !== undefined && obj.timingData.length > 0) {
                for (const times of obj.timingData) {
                  times.SEC = (times.SEC / 60).toFixed(0);
                }
              }
            }

            if (options) {
              resolve(options);
            } else {
              reject();
            }


          }

        }, (error) => {
          reject(error);
        });
    });
  }


  setClass(userData: any, field: any, orderBy: any, setFiledName: any): void {
    const removeData = _.remove(userData, function (o) { return o[field] === undefined; });
    const sortArrayByPresent = _.orderBy(userData, [field], [orderBy]);
    let totalUser = sortArrayByPresent.length;
    const i2 = sortArrayByPresent.length % 3;
    totalUser = totalUser - i2;
    totalUser = totalUser / 3;
    for (let i1 = 0; i1 < sortArrayByPresent.length; i1++) {
      if (sortArrayByPresent.length < 3) {
        if (i1 === 0) {
          sortArrayByPresent[i1][setFiledName] = 'top';
        } else {
          sortArrayByPresent[i1][setFiledName] = 'bottom';
        }
      } else if (i1 < (totalUser)) {
        sortArrayByPresent[i1][setFiledName] = 'top';
      } else if (i1 < ((totalUser * 2) + i2)) {
        sortArrayByPresent[i1][setFiledName] = 'middle';
      } else if (i1 < ((totalUser * 3) + i2)) {
        sortArrayByPresent[i1][setFiledName] = 'bottom';
      }
    }
    if (removeData !== undefined && removeData.length > 0) {
      for (const addData of removeData) {
        userData.push(addData);
      }
    }
  }

  // calculate Average Function
  public calculateAverage(calculatedData: any, option?: any): void {
    const CaurrentData = JSON.parse(JSON.stringify(calculatedData));
    let ConterTotalCallTime = 0;
    let ConterTotalTimePresent = 0;
    let ConterTotalBreakTime = 0;
    this.averageCouters = { 'totalTimePresent': 0, 'totalBreakTime': 0, 'totalCallTime': 0 };
    for (const calc of CaurrentData) {
      if (calc.totalTimePresent !== undefined && calc.totalTimePresent !== '') {
        this.averageCouters.totalTimePresent = this.averageCouters.totalTimePresent + calc.totalTimePresent;
        ConterTotalTimePresent++;
      }
      if (calc.totalBreakTime !== undefined && calc.totalBreakTime !== '') {
        this.averageCouters.totalBreakTime = this.averageCouters.totalBreakTime + calc.totalBreakTime;
        ConterTotalBreakTime++;
      }
      if (calc.totalCallTime !== undefined && calc.totalCallTime !== '') {
        this.averageCouters.totalCallTime = this.averageCouters.totalCallTime + calc.totalCallTime;
        ConterTotalCallTime++;
      }
    }
    this.averageCouters.totalTimePresent = this.hhmmss((this.averageCouters.totalTimePresent / ConterTotalTimePresent));
    this.averageCouters.totalBreakTime = this.hhmmss((this.averageCouters.totalBreakTime / ConterTotalBreakTime));
    this.averageCouters.totalCallTime = this.hhmmss((this.averageCouters.totalCallTime / ConterTotalCallTime));
    option.averageCouters = JSON.parse(JSON.stringify(this.averageCouters));
  }


  public hhmmss(minutes: any): any {
    if (minutes === undefined) {
      return '';
    }
    minutes = Math.round(minutes);
    const hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ':' + this.pad(minutes);
  }

  // add padding From start of minitues
  public pad(num: any): any {
    return ('0' + num).slice(-2);
  }

}

