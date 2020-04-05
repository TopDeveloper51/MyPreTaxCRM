// External imports
import { Injectable } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService, SystemConfigurationService } from "@app/shared/services";
import { APINAME } from "@app/ticket/ticket-constants";

@Injectable()
export class TicketSearchService {
  public ticketLookup: any = {
    departmentList: [],
    ticketStatusList: [],
    salesProcessStatusList: [],
    stateList: [],
    ticketTypeList: [],
    outcomeList: [],
    resolutionList: [],
    resellerList: [],
    preferredLanguageList: [],
    allLookupDataForTicket: [],
    yearList: [],
    efileReadinessStatus: [],
    trainingStatus: [],
    bankEnrollmentStatus: [],
    conversionsStatus: [],
    proformaStatus: [],
    paymentStatus: [],
    loginStatus:[],
  };

  constructor(
    private systemConfig: SystemConfigurationService,
    private commonApiService: CommonApiService
  ) { }

  /**
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @param {Object} searchvalue
   * @returns available tickets
   * @memberof TicketSearchService
   */
  public searchData(searchvalue) {
    let ticketSearch: any = {};
    ticketSearch = JSON.parse(JSON.stringify(searchvalue));
    // ticketSearch.pageNr = 1;
    // ticketSearch.sortDirection = "desc";
    // ticketSearch.sortExpression = "customerName";


    if (searchvalue.customerNr) {
      ticketSearch.customerNr = ticketSearch.customerNr.toString().trim();
      ticketSearch.customerNr = ticketSearch.customerNr.toString().replace(/#/g, '');
    }

    for (let key in ticketSearch) {
      if (key === 'dateFrom') {
        if (ticketSearch[key] !== null && ticketSearch[key] !== undefined && ticketSearch[key] !== '') {
          const tmpDate = new Date(ticketSearch[key]);
          ticketSearch[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
        }
      } else if (key === 'dateTo') {
        if (ticketSearch[key] !== null && ticketSearch[key] !== undefined && ticketSearch[key] !== '') {
          const tmpDate = new Date(ticketSearch[key]);
          ticketSearch[key] = moment(ticketSearch[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
        }
      }
      else if (key === 'updatedDateFrom') {
        if (ticketSearch[key] !== null && ticketSearch[key] !== undefined && ticketSearch[key] !== '') {
          const tmpDate = new Date(ticketSearch[key]);
          ticketSearch[key] = moment(ticketSearch[key]).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
        }
      }
      else if (key === 'updatedDateTo') {
        if (ticketSearch[key] !== null && ticketSearch[key] !== undefined && ticketSearch[key] !== '') {
          const tmpDate = new Date(ticketSearch[key]);
          ticketSearch[key] = moment(ticketSearch[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.TICKET_SEARCH,
          parameterObject: ticketSearch,
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
  public getLookupForTicket() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.LOOKUP_TICKET_SEARCH,
          isCachable:true,
          parameterObject: {},
          showLoading:true
        })
        .then(
          response => {
            if (response) {
              this.ticketLookup.departmentList = response.activityDepartmentList;
              this.ticketLookup.ticketStatusList = response.ticketStatusList;
              this.ticketLookup.salesProcessStatusList = response.salesProcessStatusList;

              this.ticketLookup.stateList = [];
              if (response.stateList) {
                for (const state of response.stateList) {
                  this.ticketLookup.stateList.push({ id: state.value, name: state.text });
                }
              }
              this.ticketLookup.salesProcessStatusList = [];
              for (let salesProcessStatus of response.salesProcessStatusList) {
                this.ticketLookup.salesProcessStatusList.push({ id: salesProcessStatus.id, name: salesProcessStatus.name });
              }

              this.ticketLookup.ticketTypeList = response.ticketTypeList.filter(obj => obj.status === 0);
              this.ticketLookup.outcomeList = response.outComeList;
              this.ticketLookup.resolutionList = response.resolutionList;
              this.ticketLookup.resellerList = response.resellerList;
              this.ticketLookup.preferredLanguageList = response.preferredLanguageList;
              this.ticketLookup.preferredLanguageList.unshift({ id: "blank", name: "Blank" });
              this.ticketLookup.yearList = JSON.parse(JSON.stringify(this.systemConfig.getYearList()));
              this.ticketLookup.allLookupDataForTicket = response.typeDefinationDetails;
              resolve(this.ticketLookup);
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
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @returns session rediness lookup data
   * @memberof TicketSearchService
   */
  public getLookupForTicketSeasonReadiness() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.LOOKUP_SEASON_READINESS,
          isCachable:true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              if (response.efileReadinessStatus) {
                this.ticketLookup.efileReadinessStatus = response.efileReadinessStatus;
              }
              if (response.trainingStatus) {
                this.ticketLookup.trainingStatus = response.trainingStatus;
              }
              if (response.bankEnrollmentStatus) {
                this.ticketLookup.bankEnrollmentStatus = response.bankEnrollmentStatus;
              }
              if (response.conversionsStatus) {
                this.ticketLookup.conversionsStatus = response.conversionsStatus;
              }
              if (response.proformaStatus) {
                this.ticketLookup.proformaStatus = response.proformaStatus;
              }
              if (response.paymentStatus) {
                this.ticketLookup.paymentStatus = response.paymentStatus;
              }
              if (response.loginStatus) {
                this.ticketLookup.loginStatus = response.loginStatus;
              }

              resolve(this.ticketLookup);
            }
            else {
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
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @param {*} tmpDate
   * @returns {*} formated date time
   * @memberof TicketSearchService
   */
  public isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  };


  public GetTicketSearchCriteriaList() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_TICKET_FILTER,
          parameterObject: { type: 'ticket' }
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

  public saveTicketSFilter(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.SAVE_TICKET_FILTER,
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

  public getTicketSFilterByID(param) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_TICKET_FILTER_BY_ID,
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

  public deleteSavedTicketSFilter(param) {
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



}
