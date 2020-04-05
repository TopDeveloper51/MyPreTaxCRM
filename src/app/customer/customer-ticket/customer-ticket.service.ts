// External imports
import { Injectable } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService, SystemConfigurationService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";

@Injectable()
export class CustomerTicketService {
  public ticketLookup: any = {
    ticketStatusList: [],
    yearList: [],
    departmentList: []
  };

  constructor(
    private systemConfig: SystemConfigurationService,
    private commonApiService: CommonApiService
  ) { }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @param {Object} searchvalue
   * @returns available tickets
   * @memberof TicketSearchService
   */
  public searchData(searchvalue, customerID, isTestCustomer) {
    let ticketSearch: any = {};
    ticketSearch = JSON.parse(JSON.stringify(searchvalue));
    ticketSearch.customerId = customerID;
    ticketSearch.isTestCustomer = isTestCustomer;
    ticketSearch.pageNr = 1;
    ticketSearch.pageSize = 50;
    ticketSearch.sortDirection = "desc";
    ticketSearch.sortExpression = "customerName";
    let department = [];
    for (let i = 0; i < ticketSearch.department.length; i++) {
      if (ticketSearch.department[i]) {
        department.push(this.ticketLookup.departmentList[i].name)
      }
    }
    ticketSearch.department = department;

    console.log(ticketSearch)

    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.TICKET_SEARCH_CUSTOMER,
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
   * @createdDate 05/12/2019
   * @returns lookup data
   * @memberof TicketSearchService
   */
  public getLookupForTicket() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.LOOKUP_TICKET_SEARCH,
          isCachable: true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              this.ticketLookup.ticketStatusList = response.ticketStatusList;
              this.ticketLookup.yearList = this.systemConfig.getYearList();
              this.ticketLookup.yearList = this.ticketLookup.yearList.reverse();
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

  public getDepartmentLookUp() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_ACTIVITY_DEPARTMENT_LOOKUP,
          isCachable:true,
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              this.ticketLookup.departmentList = response;
              resolve(this.ticketLookup.departmentList);
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

  public deleteTicket(ticketId) {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.DELETE_MULTIPLE_TICKET,
          parameterObject: { ticketId: ticketId},
          showLoading: true
        })
        .then(
          response => {
            if (response) {
              resolve(response);
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
