// External imports
import { Injectable } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService, SystemConfigurationService, UserService } from "@app/shared/services";
import { APINAME } from "@app/activity/activity-constants";

@Injectable({
  providedIn: 'root'
})
export class ActivitySearchService {
  public activityLookup: any = {
    activitystatuslist: [],
    year: [],
    tagListLkp: [],
    feedbacklist: [],
    activityTypelist: [],
    departmentlistDetail: [],
    responsiblePesronList: [],
    salesProcessStatusList: [],
    priorityList: [],
    resellerList: [],
    ticketStatusList: [],
    shiftList: [],
    preferredLanguageList: [],
  };
  userDetails = this.userService.getUserDetail();

  // public shift: any = [];
  // public shiftTimings: any = {};

  constructor(
    private systemConfig: SystemConfigurationService,
    private commonApiService: CommonApiService,
    private userService: UserService
  ) { }

  prepareLookupDataForApiParams(lookup) {
    let tempdata = [];
    lookup.forEach(element => {
      tempdata.push({ id: element });
    });
    return tempdata;
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @param {Object} searchvalue
   * @returns available tickets
   * @memberof CustomerSearchService
   */
  public searchData(searchvalue) {
    let activitySearch: any = {};
    activitySearch.pageNo = 1;
    activitySearch.sortDirection = "desc";
    activitySearch.sortExpression = "datetime";
    activitySearch.activityType = searchvalue.activityType && searchvalue.activityType.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.activityType) : [];
    activitySearch.year = searchvalue.year && searchvalue.year.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.year) : [];
    activitySearch.activitystatus = searchvalue.activitystatus && searchvalue.activitystatus.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.activitystatus) : [];
    activitySearch.createdBy = searchvalue.createdBy && searchvalue.createdBy.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.createdBy) : [];
    activitySearch.department = searchvalue.department && searchvalue.department.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.department) : [];
    activitySearch.feedback = searchvalue.feedback && searchvalue.feedback.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.feedback) : [];
    activitySearch.priority = searchvalue.priority && searchvalue.priority.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.priority) : [];
    activitySearch.resellerId = searchvalue.resellerId && searchvalue.resellerId.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.resellerId) : [];
    activitySearch.responsiblePerson = searchvalue.responsiblePerson && searchvalue.responsiblePerson.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.responsiblePerson) : [];
    activitySearch.salesProcessStatus = searchvalue.salesProcessStatus && searchvalue.salesProcessStatus.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.salesProcessStatus) : [];
    activitySearch.tagList = searchvalue.tagList && searchvalue.tagList.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.tagList) : [];
    activitySearch.updatedBy = searchvalue.updatedBy && searchvalue.updatedBy.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.updatedBy) : [];
    activitySearch.shift = searchvalue.shift && searchvalue.shift.length > 0 ? this.prepareLookupDataForApiParams(searchvalue.shift) : [];
    activitySearch.preferredLanguage = searchvalue.preferredLanguage && searchvalue.preferredLanguage !== null ? searchvalue.preferredLanguage : '';
    activitySearch.returnFullResult = searchvalue.returnFullResult;
    for (const key in searchvalue) {
      if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
        if (typeof searchvalue[key] !== 'boolean') {
          if (key !== 'activityType' && key !== 'year' && key !== 'department' && key !== 'salesProcessStatus' && key !== 'tagList' && key !== 'activitystatus' && key !== 'responsiblePerson' && key !== 'feedback' && key !== 'priority' && key !== 'resellerId' && key !== 'createdBy' && key !== 'updatedBy' && key !== 'preferredLanguage') {
            searchvalue[key] = searchvalue[key].toString().trim();
            if (key === 'customerNumber') {
              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                searchvalue[key] = searchvalue[key].toString().replace(/#/g, '');
              }
            } else if (key === 'dateFrom') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                if (searchvalue.shift && searchvalue.shift.length > 0) {
                  let localTime = moment(moment(tmpDate).format('YYYY-MM-DD') + ' ' + searchvalue.shiftStartTime).utc().format();
                  searchvalue[key] = moment(localTime).tz('America/New_York').format()
                } else {
                  searchvalue[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
                }
              }
            } else if (key === 'dateTo') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                if (searchvalue.shift && searchvalue.shift.length > 0) {
                  let localTime = moment(moment(tmpDate).format('YYYY-MM-DD') + ' ' + searchvalue.shiftEndTime).utc().format();
                  if (searchvalue.shiftEndTime < '12:00:00') {
                    searchvalue[key] = moment(localTime).add(1, 'days').tz('America/New_York').format();
                  } else {
                    searchvalue[key] = moment(localTime).tz('America/New_York').format();
                  }
                } else {
                  searchvalue[key] = moment(searchvalue[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
                }
              }

            } else if (key === 'plannedDateFrom') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }
            } else if (key === 'plannedDateTo') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(searchvalue[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }

            }
            else if (key === 'createdDateFrom') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }
            } else if (key === 'createdDateTo') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(searchvalue[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }

            } else if (key === 'upadtedDateFrom') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }
            } else if (key === 'upadtedDateTo') {

              if (searchvalue[key] !== null && searchvalue[key] !== undefined && searchvalue[key] !== '') {
                const tmpDate = new Date(searchvalue[key]);
                searchvalue[key] = moment(searchvalue[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
              }

            }
          }
        }
      }
    }

    if (searchvalue.isTestCustomer) {
      activitySearch.isTestCustomer = searchvalue.isTestCustomer
    }else{
      activitySearch.isTestCustomer = false;
    }
    if (searchvalue.actsWithoutTicket) {
      activitySearch.actsWithoutTicket = searchvalue.actsWithoutTicket
    }
    if (searchvalue.isCurrentRefundRequest) {
      activitySearch.isCurrentRefundRequest = searchvalue.isCurrentRefundRequest
    }
    if (searchvalue.isRefundRequestDenied) {
      activitySearch.isRefundRequestDenied = searchvalue.isRefundRequestDenied
    }
    if (searchvalue.freeText !== null) {
      activitySearch.freeText = searchvalue.freeText
    }
    if (searchvalue.Customer !== null) {
      activitySearch.Customer = searchvalue.Customer
    }
    if (searchvalue.customerNumber !== null) {
      activitySearch.customerNumber = searchvalue.customerNumber
    }
    if (searchvalue.plannedDateFrom !== null) {
      activitySearch.plannedDateFrom = searchvalue.plannedDateFrom
    }
    if (searchvalue.plannedDateTo !== null) {
      activitySearch.plannedDateTo = searchvalue.plannedDateTo
    }
    if (searchvalue.dateTo !== null) {
      activitySearch.dateTo = searchvalue.dateTo
    }
    if (searchvalue.dateFrom !== null) {
      activitySearch.dateFrom = searchvalue.dateFrom
    }
    if (searchvalue.updatedDateFrom !== null) {
      activitySearch.updatedDateFrom = searchvalue.updatedDateFrom
    }
    if (searchvalue.updatedDateTo !== null) {
      activitySearch.updatedDateTo = searchvalue.updatedDateTo
    }
    if (searchvalue.createdDateFrom !== null) {
      activitySearch.createdDateFrom = searchvalue.createdDateFrom
    }
    if (searchvalue.createdDateTo !== null) {
      activitySearch.createdDateTo = searchvalue.createdDateTo
    }
    // if (searchvalue.returnFullResult) {
    //   activitySearch.returnFullResult = searchvalue.returnFullResult
    // }
    
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.ACTIVITY_SEARCH,
          parameterObject: activitySearch,
          showLoading: true
        })
        .then(
          response => {
            let availableTicket;
            if (response) {
              availableTicket = {
                data: response,
                total: response
                  ? response.length > 0
                    ? response[0].totalCount
                    : 0
                  : 0
              };
            }
            resolve(availableTicket);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 22/10/2019
   * @returns lookup data
   * @memberof TicketSearchService
   */
  public getLookupForActivity() {
    this.activityLookup = {};
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.ACTIVITY_LOOKUP,
          isCachable:true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              this.activityLookup.activitystatuslist = response.activityStatusList;
              this.activityLookup.year = JSON.parse(JSON.stringify(this.systemConfig.getYearList()));
              if (this.activityLookup.year.findIndex(t => t.id == "blank") == -1) {
                this.activityLookup.year.unshift({ id: "blank", name: "Blank" });
              }
              this.activityLookup.tagListLkp = response.activityTagList;
              this.activityLookup.tagListLkp.unshift({ id: "blank", name: "Blank" });
              this.activityLookup.activitystatuslist.unshift({ id: "blank", name: "Blank" });
              this.activityLookup.feedbacklist = response.activityFeedbackList;
              this.activityLookup.activityTypelist = response.activityArtList;
              this.activityLookup.departmentlistDetail = response.activityDepartmentList;
              this.activityLookup.departmentlistDetail.unshift({ id: "blank", name: "Blank" });
              this.activityLookup.responsiblePesronList = response.responsiblePesronList;
              this.activityLookup.responsiblePesronList.unshift({
                // group: "",
                id: "blank",
                name: "Blank",
              });
              this.activityLookup.salesProcessStatusList = response.salesProcessStatusList;
              this.activityLookup.priorityList = response.activityPriorityList;
              this.activityLookup.resellerList = response.resellerList;
              this.activityLookup.ticketStatusList = response.ticketStatusList;
              this.activityLookup.shiftList = this.userDetails.crmAppConfig.shiftTimings
              this.activityLookup.preferredLanguageList = response.preferredLanguageList;
              this.activityLookup.preferredLanguageList.unshift({ id: "blank", name: "Blank" });

              this.activityLookup.tempResponsiblePerson = [];
              this.activityLookup.tempResponsiblePerson.unshift({ groupName: '', group: [{ id: 'blank', name: 'Blank' }] });

              resolve(this.activityLookup);
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

  public GetActivitySearchCriteriaList() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_ACTIVITY_FILTER,
          parameterObject: { type: 'activity' }
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  public saveActivityFilter(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.SAVE_ACTIVITY_FILTER,
          parameterObject: param
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  public getActivityFilterByID(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_ACTIVITY_FILTER_BY_ID,
          parameterObject: param
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  public deleteSavedActivityFilter(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.DELETE_SAVED_FILTER,
          parameterObject: param
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }


  // check the givent date is in day light saving on EST zone  or not
  isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  };

  public generateExcelTicketByActivity(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GENERATE_EXCEL_TICKET_BY_ACTIVITY,
          parameterObject: param
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  public changeCustomer(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.CHANGE_CUSTOMER,
          parameterObject: param
        })
        .then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
    });
  }


  /**
 * @author Manali Joshi
 * @createdDate 3/1/2020
 * @returns Customer Details
 * @memberof ActivitySearchService
 */
  public getCustomerDetails(customerId) {
    return new Promise((resolve, reject) => {
      console.log(`getCustomerDetails ${customerId}`);
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAIL, parameterObject: { 'customerID': customerId }, showLoading: false }).then((response) => {
        let customerInfo = response;
        // customerInfo.customerId = customerId;
        // this.activityData.salesProcessStatus = this.customerInfo.salesProcessStatus;
        //this.activityData.doNotCall = this.customerInfo.doNotCall;
        // this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData });
        resolve(customerInfo);
      });
    });
  }


  /**
  * @author Manali Joshi
  * @createdDate 13/1/2020
  * @returns Customer Details
  * @memberof ActivitySearchService
  */
  public getActivityFilter(requestObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_FILTER, parameterObject: { type: 'activity', userId: requestObject.userId } })
        .then(response => {
          resolve(response);
        });
    });
  };

}
