// External imports
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService, SystemConfigurationService, UserService, DialogService, MessageService, LocalStorageUtilityService } from "@app/shared/services";
import { LoaderService } from '@app/shared/loader/loader.service';
import { APINAME } from '@app/ticket-activity/ticket-activity.constants';
import { TicketSetupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/ticket-setup/ticket-setup.component';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';

@Injectable()
export class TicketActivityDetailService {
  public lookup: any = {
    salesProcessStatusList: [], allTicketDefinition: [], allTicketDefinitionDetail: [],
    activityDepartmentList: [], statusList: [],
    activityPriorityList: [],
    activityTagList: [],
    salesTypeList: [],
    activityTypeList: [],
    activityStatusList: [],
    planList: [],
    bankList: [],
    ticketStatusList: [],
    resolutionList: [],
    outComeTypeList: [],
    ticketTypeList: [],
    yearsList: [],
    monthList: [],
    trainingGroup: [],
    trainingActualValues: [],
    // 1on1 Setup
    setUpTrainingCancel: [],


  };

  public clsActivityServiceStatusLookupData: any = [];
  public responsiblePersonTempArray: any = [];
  public activityData: any = {}
  public ticketList: any = []
  public customerInfo: any = {};
  public pastTicketActivityData: any = {};
  formattedCreatedDate: string = '';
  public newTicketStatus: Array<any> = []; // store added ticket but not associated to show msg

  constructor(
    private router: Router,
    private commonApiService: CommonApiService,
    private userService: UserService,
    private systemConfig: SystemConfigurationService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private localStorageService: LocalStorageUtilityService,
    private loader: LoaderService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private ticketActivityOverlayService: TicketActivityOverlayService
  ) { }

  // when user Change Mode from Activity From URL set Value
  public setPastTicketActivityDataStore(pastTicketActivityData: any): void {
    this.pastTicketActivityData = pastTicketActivityData;
    this.localStorageService.addToLocalStorage('pastTicketActivityData', pastTicketActivityData);
  }
  // when user Change Mode from Activity From URL set Value
  public getPastTicketActivityDataStore(): any {
    if (this.pastTicketActivityData !== undefined) {
      return this.pastTicketActivityData
    } else {
      let pastTicketActivityData = this.localStorageService.getFromLocalStorage('pastTicketActivityData');
      return pastTicketActivityData;
    }
  }

  getPDUserData() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_DIALER_USER_LIST, parameterObject: {}, showLoading: false }).then((response) => {
        resolve(response)
      });
    });

  }


  /**
   * @author Dhruvi Shah
   * @createdDate 18/10/2019
   * @returns
   * @memberof TicketActivityDetailService
   */
  public getActivityDetails(id: string, modelData?) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_DETAILS_BY_ACTIVITYID, parameterObject: { 'ID': 'ACT_' + id }, showLoading: false }).then((response) => {
        this.activityData = response;

        this.activityData.id = id;

        if (this.activityData.status_value !== undefined && this.activityData.status_value !== null) {
          this.activityData.status_value = this.activityData.status_value.toString();
        }

        if (this.activityData.department !== undefined && this.activityData.department !== null && this.activityData.department !== '') {
          // line below is written because sometimes we don't get capitalize first letter in string.
          this.activityData.department = this.activityData.department.charAt(0).toUpperCase() + this.activityData.department.substring(1);
        } else {
          this.activityData.department = 'Support';
        }

        if (this.activityData.information !== undefined) {
          this.activityData.information = this.activityData.information;
        } else {
          this.activityData.information = '';
        }
        this.activityData.contactPerson = response.contactPerson;
        this.ticketList = this.activityData.ticketDetails;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData, id: modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: modelData.id });
        resolve({ 'activityData': this.activityData, 'ticketList': this.ticketList });
        this.ticketActivityIntegrityService.setActivityDetails(this.activityData);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/01/2020
   * @memberof TicketActivityDetailService
   */
  public getActivityDetailsNew(id: string, modelData?) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_DETAILS_BY_ACTIVITYID_NEW, parameterObject: { 'ID': 'ACT_' + id }, showLoading: true }).then((response) => {
        this.activityData = response;

        this.activityData.id = id;

        if (this.activityData.status_value !== undefined && this.activityData.status_value !== null) {
          this.activityData.status_value = this.activityData.status_value.toString();
        }

        if (this.activityData.department !== undefined && this.activityData.department !== null && this.activityData.department !== '') {
          // line below is written because sometimes we don't get capitalize first letter in string.
          this.activityData.department = this.activityData.department.charAt(0).toUpperCase() + this.activityData.department.substring(1);
        } else {
          this.activityData.department = 'Support';
        }

        if (this.activityData.information !== undefined) {
          this.activityData.information = this.activityData.information;
        } else {
          this.activityData.information = '';
        }
        this.activityData.contactPerson = response.contactPerson;
        this.ticketList = this.activityData.ticketDetails;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData, id: modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: modelData.id });
        resolve({ 'activityData': this.activityData, 'ticketList': this.ticketList });
        this.ticketActivityIntegrityService.setActivityDetails(this.activityData);
      });
    });
  }

  /**
   * @author Mansi Makwana 
   * @createdDate 04/11/2019
   * @description this function is used to get the entire ticket data of an individual customer based on specific filters
   * @returns an array of ticket detail objects
   * @memberof TicketActivityDetailService
   */
  public getCustomerTicketData(apiParams) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_TICKET, parameterObject: apiParams, showLoading: false }).then((response) => {
        resolve(response);
      });
    });
  }

  /**
   * @author Mansi Makwana 
   * @createdDate 11/11/2019
   * @returns ticket details
   * @memberOf TicketActivityDetailService
   */
  public searchTicketForActivity(apiParams) {
    let customerTickets: any;
    let availableSetupTickets = [];
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_TICKET, parameterObject: apiParams, showLoading: false }).then((response) => {
        customerTickets = response;
        let isExists = customerTickets.findIndex(obj => (obj.department === 'Setup'
          && obj.year === '2019'));
        availableSetupTickets = customerTickets.filter(obj => (obj.department === "Setup" && obj.year === '2019'));
        let ticketExists = false;
        if (isExists > -1) {
          ticketExists = true;
        }
        let deptYear = { 'department': 'Setup', 'year': '2019' }
        this.dialogService.custom(TicketSetupComponent, { 'data': { 'availableSetupTickets': availableSetupTickets, 'ticketExists': ticketExists, 'deptYear': deptYear } },
          { 'keyboard': true, 'backdrop': true, 'size': 'lg' }).result.then((response) => {
            if (response) {
              resolve(response);
            }
          }, (error) => { console.error(error); });

      });
    });
  }


  /**
   * @author Mansi Makwana 
   * @createdDate 11/11/2019
   * @discription create ticket for department setup, year 2018 and ticket type setup
   * @memberOf TicketActivityDetailService
   */

  createTicket() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SETUP_TICKET, parameterObject: { 'customerId': this.activityData.customerId }, showLoading: false }).then(response => {
        if (response) {
          const self = this;
          self.messageService.showMessage('Ticket and Activity created Successfully', 'success');
          resolve(response);
        }
      });
    });
  }

  /**
   * @author Sheo Ouseph
   * @createdDate 04/11/2019
   * @returns ticket details
   * @memberof TicketActivityDetailService
   */
  public getTicketDetails(id: string, modelData: any, screeName?: string, customerId?: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKET_BY_ID_NEW, parameterObject: { 'ticketId': id }, showLoading: true }).then(response => {
        if (response.activityDetails !== undefined && response.activityDetails.length > 0) {
          const index = response.activityDetails.findIndex(obj => obj.customerId == customerId);
          let actId;
          if (index !== -1) {
            actId = response.activityDetails[index].id;
          } else {
            actId = response.activityDetails[0].id;
          }
          // if (this.modelData) {
          //   let localOpenIds = this.localStorageUtilityService.getFromLocalStorage('selectedActivityIds');
          //   let isExists = localOpenIds.findIndex(t => t.activityId === actId);
          //   if (isExists === -1) {
          //     // this._activityService.emitHighlightChangeEvent({ previousActivityId: { activityId: this.modelData.id, ticketId: this.modelData.ticketId, screen: this.modelData.screen, dialogId: this.modelData['dialogId'] }, currentActivityId: { activityId: actId, screen: 'activity', dialogId: this.modelData['dialogId'] }, screen: this.modelData.screen });
          //     this._activityService.emitHighlightChangeEvent({ previousActivityId: { activityId: this.modelData.id, ticketId: this.modelData.ticketId, screen: this.modelData.screen, dialogId: this.modelData['dialogId'] }, currentActivityId: { ticketId: id, screen: 'ticket', dialogId: this.modelData['dialogId'] }, screen: this.modelData.screen });
          //     this.modelData.ticketId = id;
          //     this.modelData.screen = 'ticket';
          //     this.getActivityDetails(actId);
          //   } else {
          //     this.messageService.showMessage({ 'type': 'error', 'message': 'Activity Already Opened', 'locale': 'FILTERADD_SUCCESS' });
          //     if (localOpenIds[isExists].dialogId !== undefined && localOpenIds[isExists].dialogId !== null) {
          //       this.overlayDialogService.setFocus(localOpenIds[isExists].dialogId);
          //     }
          //   }
          // } else {
          this.getActivityDetailsNew(actId, modelData).then(
            (result: any) => {
              response.activityData = result.activityData;
              response.ticketList = result.ticketList;

              // this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityId', data: actId, id: modelData.id });
              // this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'customerID', data: response.customerId, id: modelData.id })
              resolve(response);
            },
            error => {
              console.log(error);
            }
          )
          // }
        }
        else {
          response.ticketList = [(response)];
          response.activityData = {};

          // (this.modelData && this.modelData.screen === 'activity') || (this.urlParameters && this.urlParameters.screeName === 'activity')

          if (screeName === 'activity') {
            // let activities = this.localStorageUtilityService.getFromLocalStorage('selectedActivityIds');
            // let index = activities.findIndex(t => t.activityId === this.modelData.id);
            // if (index !== -1) {
            //   activities[index].activityId = undefined;
            //   activities[index].ticketId = id;
            //   activities[index].screen = 'ticket';
            //   if (this.modelData) {
            //     this.modelData.id = undefined;
            //     this.modelData.ticketId = id;
            //     this.modelData.screen = 'ticket';
            //   }
            //   this.localStorageUtilityService.addToLocalStorage('selectedActivityIds', activities);
            // }
          }
          // this.currentActivityIndex = this.arrOfActivityIds.findIndex(obj => obj.id === this.modelData.ticketId);
          // this.activityMode = "NotAvailable"

          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: response.ticketList, id: modelData.id });

          resolve(response);
        }
      })
    });
  }

  public getCustomerDetails(customerId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAILS_BY_CUSTOMERID, parameterObject: { 'customerID': customerId }, showLoading: false }).then((response) => {
        let customerInfo = response;
        customerInfo.customerId = customerId;
        this.activityData.salesProcessStatus = this.customerInfo.salesProcessStatus;
        this.activityData.doNotCall = this.customerInfo.doNotCall;


        /**  */
        // this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'activityData', data: this.activityData });
        resolve(customerInfo);
      });
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 04-Nev-2019
  * @description get customer open activities list
  * @memberof TicketActivityDetailService
  */

  public getCustomerOpenActivities(id: string) {
    let reqParam: any = {};

    // not needed as per the new API
    reqParam.customerID = id;
    reqParam.sortExpression = "datetime";
    reqParam.sortDirection = "desc";
    reqParam.pageSize = 50;
    reqParam.pageNo = 1;

    // creating an array list of all activity statuses having an open status from the lookup values received as input
    if (this.lookup.activityStatusList && this.lookup.activityStatusList.length > 0) {
      reqParam.activitystatus = [];
      for (let index = 0; index < this.lookup.activityStatusList.length; index++) {
        if (!this.lookup.activityStatusList[index].closeStatus) {
          reqParam.activitystatus.push({ 'id': JSON.parse(this.lookup.activityStatusList[index].id) });
        }
      }
    }
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CUSTOMER_CARD_ACTIVITY_SEARCH, parameterObject: reqParam, showLoading: false }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }



  /**
   * @author Satyam Jasoliya
   * @createdDate 13-Nev-2019
   * @description get activity history
   * @memberof TicketActivityDetailService
   */
  public getActivityHistory(id: string) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_HISTORY, parameterObject: id, showLoading: false }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 13-Nev-2019
  * @description get customer list
  * @memberof TicketActivityDetailService
  */
  public getCustomerList(customerList: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_LIST, parameterObject: customerList, showLoading: false }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 13-Nev-2019
* @description get customer list
* @memberof TicketActivityDetailService
*/
  public getCustomerListAccordingContactDetails(contactList: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAIL_ACCORDING_TO_CONTACT_DETAIL, parameterObject: contactList, showLoading: false }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 13-Nev-2019
   * @description get customer list
   * @memberof TicketActivityDetailService
   */
  public getCountryCodeList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_COUNTRY_CODE_LIST, parameterObject: {} }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 13-Nev-2019
  * @description get customer list
  * @memberof TicketActivityDetailService
  */
  public getStateCodeList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_STATE_CODE_LIST, parameterObject: {} }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 01/01/2020
   * @description get ticket Type fieldlist
   * @memberof TicketActivityDetailService
   */
  public getTicketTypeFieldList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKETTYPE_FEILDLIST, parameterObject: {} }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 01/01/2020
   * @description get ticket Type fieldlist
   * @memberof TicketActivityDetailService
   */
  public getNewLookupForTicketSearch() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_NEW_LOOKUP_FOR_TICKET_SEARCH, isCachable: true, parameterObject: {} }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 18/10/2019
   * @returns
   * @memberof TicketActivityDetailService
   */
  public getAllLookup() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_LOOKUP,
          isCachable: true,
          parameterObject: {},
          showLoading: false
        })
        .then(
          response => {
            if (response) {
              // Activity Lookup
              response.activityLookup = response.activityLookup ? response.activityLookup : {};
              this.lookup.salesProcessStatusList = response.activityLookup.salesProcessStatusList ? response.activityLookup.salesProcessStatusList : [];
              this.lookup.activityDepartmentList = response.activityLookup.activityDepartmentList ? response.activityLookup.activityDepartmentList : [];
              this.lookup.activityPriorityList = response.activityLookup.activityPriorityList ? response.activityLookup.activityPriorityList : [];
              this.lookup.activityTagList = response.activityLookup.activityTagList ? response.activityLookup.activityTagList : [];
              this.lookup.salesTypeList = response.activityLookup.salesTypeList ? response.activityLookup.salesTypeList : [];
              this.lookup.activityTypeList = response.predefinedList ? response.predefinedList : {};
              this.lookup.responsiblePersonList = response.activityLookup.responsiblePesronList ? response.activityLookup.responsiblePesronList : [];
              // Activity Status
              let activityStatusList = response.activityLookup.activityStatusList ? response.activityLookup.activityStatusList : [];
              activityStatusList.forEach(data => {
                this.lookup.activityStatusList.push({ id: data.id.toString(), name: data.name, closeStatus: data.closeStatus })
              });
              // Plan List
              let planList = response.activityLookup.planList ? response.activityLookup.planList : [];
              planList.forEach(data => { this.lookup.planList.push({ id: data.shortName, name: data.displayText }); });
              // Bank List
              let bankList = response.activityLookup.bankList ? response.activityLookup.bankList : [];
              bankList.forEach(data => { this.lookup.bankList.push({ id: data.id, name: data.value }); });
              //
              this.lookup.activityTypeList = response.predefinedList;
              //to show or hide the type 'meeting' from the type list based on the type of activity
              if (this.activityData.type == 'meeting') {
                for (const obj of Object.keys(this.lookup.activityTypeList)) {
                  if (obj != 'meeting') {
                    delete this.lookup.activityTypeList[obj];
                  }
                }
              } else {
                delete this.lookup.activityTypeList.meeting;
              }
              // ticketStatusList
              let ticketStatusList = response.activityLookup.ticketStatusList ? response.activityLookup.ticketStatusList : [];
              ticketStatusList.forEach(data => {
                this.lookup.ticketStatusList.push({ id: data.id.toString(), name: data.name })
              });
              // resolutionList
              let resolutionList = response.activityLookup.resolutionList ? response.activityLookup.resolutionList : [];
              resolutionList.forEach(data => {
                this.lookup.resolutionList.push({ id: data.id.toString(), name: data.name })
              });
              // outComeTypeList
              let outComeTypeList = response.activityLookup.outcomeList ? response.activityLookup.outcomeList : [];
              outComeTypeList.forEach(data => {
                this.lookup.outComeTypeList.push({ id: data.id.toString(), name: data.name })
              });
              // ticketTypeList
              let ticketTypeList = response.activityLookup.ticketTypeList ? response.activityLookup.ticketTypeList : [];
              ticketTypeList.forEach(data => {
                this.lookup.ticketTypeList.push({ id: data.id.toString(), name: data.name })
              });
              // Static Lookup
              this.lookup.yearsList = this.systemConfig.getYearList();
              this.lookup.monthList = this.systemConfig.getMonthList();
              this.lookup.statusList = [{ id: 'open', name: 'Show Open' }, { id: 'close', name: 'Show Closed' }, { id: 'all', name: 'Show All' }];
              // Ticket Lookup
              this.lookup.allTicketDefinitionDetail = response.typeDefinationDetails;
              this.lookup.allTicketDefinition = response.typeDefinationDetails.map(obj => obj.name.toLowerCase())

              this.lookup.errorTypeList = {};
              for (let type of this.lookup.allTicketDefinitionDetail) {
                this.lookup.errorTypeList[type.id] = [];
                for (let error of type.typeDefination.errorType) {
                  this.lookup.errorTypeList[type.id].push({ id: error.id.toString(), name: error.displayText, knowledgeBase: error.knowledgeBase, isDeleted: error.isDeleted });
                }
              }
              // 1 On 1 Setup Training Plan Code Lookup Strat
              if (this.userService.getUserDetail().role === 'Support - US' || this.userService.getUserDetail().role == 'Customer Relation' || this.userService.getUserDetail().isSupportManager === true) {
                this.lookup.setUpTrainingCancel = [
                  { id: 'priorly_Cancelled_By_Customer', name: 'Appt. Priorly Cancelled by Cust.' },
                  { id: 'priorly_Rescheduled_By_Customer', name: 'Appt. Priorly Rescheduled by Cust.' },
                  { id: 'customer_Did_Not_Show_Up', name: 'Cust. didn\'t show up' },
                  { id: 'Cancelled_By_Customer_On_Scheduled_Day', name: 'Appt. Cancelled by Cust. on Scheduled Day' },
                  { id: 'Rescheduled_By_Customer_On_Scheduled_Day', name: 'Appt. Rescheduled by Cust. on Scheduled Day' }
                ];
              } else if (this.userService.getUserDetail().role === 'Sales - Atlanta' || this.userService.getUserDetail().role == 'Sales - Rome') {
                this.lookup.setUpTrainingCancel = [
                  { id: 'priorly_Cancelled_By_Customer', name: 'Appt. Priorly Cancelled by Cust.' },
                  { id: 'priorly_Rescheduled_By_Customer', name: 'Appt. Priorly Rescheduled by Cust.' }
                ];
              } else {
                this.lookup.setUpTrainingCancel = [];
              }
              // 1 On 1 Setup Training Plan Code Lookup End

              resolve(this.lookup);
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
   * @author Mansi makwana
   * @createdDate 23/12/2019
   * @returns
   * @memberof TicketActivityDetailService
   */
  public getAllLookupNew() {
    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: APINAME.GET_NEW_LOOKUP,
          isCachable: true,
          parameterObject: {},
          showLoading: true
        })
        .then(
          response => {
            if (response) {

              // Activity Lookup
              response.activityLookup = response.activityLookup ? response.activityLookup : {};
              this.lookup.salesProcessStatusList = response.activityLookup.salesProcessStatusList ? response.activityLookup.salesProcessStatusList : [];
              this.lookup.activityDepartmentList = response.activityLookup.activityDepartmentList ? response.activityLookup.activityDepartmentList : [];
              this.lookup.activityPriorityList = response.activityLookup.activityPriorityList ? response.activityLookup.activityPriorityList : [];
              this.lookup.activityTagList = response.activityLookup.activityTagList ? response.activityLookup.activityTagList : [];
              this.lookup.salesTypeList = response.activityLookup.salesTypeList ? response.activityLookup.salesTypeList : [];
              this.lookup.activityTypeList = response.predefinedList ? response.predefinedList : {};
              this.lookup.responsiblePersonList = response.activityLookup.responsiblePesronList ? response.activityLookup.responsiblePesronList : [];
              this.lookup.trainingGroup = response.activityLookup.trainingGroup;
              this.lookup.trainingActualValues = response.activityLookup.trainingActualValues;

              // Activity Status
              let activityStatusList = response.activityLookup.activityStatusList ? response.activityLookup.activityStatusList : [];
              activityStatusList.forEach(data => {
                this.lookup.activityStatusList.push({ id: data.id.toString(), name: data.name, closeStatus: data.closeStatus })
              });
              // Plan List
              let planList = response.activityLookup.planList ? response.activityLookup.planList : [];
              planList.forEach(data => { this.lookup.planList.push({ id: data.shortName, name: data.displayText }); });
              // Bank List
              let bankList = response.activityLookup.bankList ? response.activityLookup.bankList : [];
              bankList.forEach(data => { this.lookup.bankList.push({ id: data.id, name: data.value }); });
              //
              this.lookup.activityTypeList = response.predefinedList;
              //to show or hide the type 'meeting' from the type list based on the type of activity
              if (this.activityData.type == 'meeting') {
                for (const obj of Object.keys(this.lookup.activityTypeList)) {
                  if (obj != 'meeting') {
                    delete this.lookup.activityTypeList[obj];
                  }
                }
              } else {
                delete this.lookup.activityTypeList.meeting;
              }
              // ticketStatusList
              let ticketStatusList = response.activityLookup.ticketStatusList ? response.activityLookup.ticketStatusList : [];
              ticketStatusList.forEach(data => {
                this.lookup.ticketStatusList.push({ id: data.id.toString(), name: data.name })
              });
              // resolutionList
              let resolutionList = response.activityLookup.resolutionList ? response.activityLookup.resolutionList : [];
              resolutionList.forEach(data => {
                this.lookup.resolutionList.push({ id: data.id.toString(), name: data.name })
              });
              // outComeTypeList
              let outComeTypeList = response.activityLookup.outcomeList ? response.activityLookup.outcomeList : [];
              outComeTypeList.forEach(data => {
                this.lookup.outComeTypeList.push({ id: data.id.toString(), name: data.name })
              });
              // ticketTypeList
              let ticketTypeList = response.activityLookup.ticketTypeList ? response.activityLookup.ticketTypeList : [];
              ticketTypeList.forEach(data => {
                this.lookup.ticketTypeList.push({ id: data.id.toString(), name: data.name })
              });
              // Static Lookup
              this.lookup.yearsList = this.systemConfig.getYearList();
              this.lookup.monthList = this.systemConfig.getMonthList();
              this.lookup.statusList = [{ id: 'open', name: 'Show Open' }, { id: 'close', name: 'Show Closed' }, { id: 'all', name: 'Show All' }];
              // Ticket Lookup
              // this.lookup.allTicketDefinition = _.sortBy(response.typeDefinationDetails, function (obj) { return obj.name.toLowerCase() });


              // this.lookup.allTicketDefinition = response.typeDefinationDetails.map(obj => obj)


              this.lookup.errorTypeList = {};
              // for (let type of this.lookup.allTicketDefinition) {
              //   this.lookup.errorTypeList[type.id] = [];
              //   for (let error of type.typeDefination.errorType) {
              //     this.lookup.errorTypeList[type.id].push({ id: error.id.toString(), name: error.displayText, knowledgeBase: error.knowledgeBase, isDeleted: error.isDeleted });
              //   }
              // }
              this.lookup.typeDefinationDetails = response.typeDefinationDetails;

              // 1 On 1 Setup Training Plan Code Lookup Strat
              if (this.userService.getUserDetail().role === 'Support - US' || this.userService.getUserDetail().role == 'Customer Relation' || this.userService.getUserDetail().isSupportManager === true) {
                this.lookup.setUpTrainingCancel = [
                  { id: 'priorly_Cancelled_By_Customer', name: 'Appt. Priorly Cancelled by Cust.' },
                  { id: 'priorly_Rescheduled_By_Customer', name: 'Appt. Priorly Rescheduled by Cust.' },
                  { id: 'customer_Did_Not_Show_Up', name: 'Cust. didn\'t show up' },
                  { id: 'Cancelled_By_Customer_On_Scheduled_Day', name: 'Appt. Cancelled by Cust. on Scheduled Day' },
                  { id: 'Rescheduled_By_Customer_On_Scheduled_Day', name: 'Appt. Rescheduled by Cust. on Scheduled Day' }
                ];
              } else if (this.userService.getUserDetail().role === 'Sales - Atlanta' || this.userService.getUserDetail().role == 'Sales - Rome') {
                this.lookup.setUpTrainingCancel = [
                  { id: 'priorly_Cancelled_By_Customer', name: 'Appt. Priorly Cancelled by Cust.' },
                  { id: 'priorly_Rescheduled_By_Customer', name: 'Appt. Priorly Rescheduled by Cust.' }
                ];
              } else {
                this.lookup.setUpTrainingCancel = [];
              }
              // 1 On 1 Setup Training Plan Code Lookup End

              resolve(this.lookup);
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



  // call when user selects any ticket from list
  public assignTicket(modelData, activityData, ticketID, isNewTicketData, year?: any, currentIndex?: number) {
    this.loader.show();
    const self = this;
    if (isNewTicketData) {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKET_BY_ID_NEW, parameterObject: { 'ticketId': ticketID }, showLoading: false }).then((response) => {
        if (response.outcome !== undefined && response.outcome.length > 0) {
          response.outcome.forEach(element => { element.toString(); });
        }
        if (response.resolution !== undefined && response.resolution.length > 0) {
          response.resolution.forEach(element => { element.toString(); });
        }
        let isExists;
        if (response.subType && response.subType.length > 0) {
          isExists = this.ticketList.findIndex(obj => (obj.department === response.department
            && obj.year === response.year
            && obj.typeId === response.typeId
            && obj.subType === response.subType));
        } else {
          isExists = this.ticketList.findIndex(obj => (obj.department === response.department
            && obj.year === response.year
            && obj.typeId === response.typeId));
        }

        if (isExists !== -1) {
          self.messageService.showMessage('Ticket already exists', 'error');
        }
        self.changeDeptOrYearOfActivity(activityData, response.department, year);
        self.ticketList.forEach(element => {
          self.newTicketStatus.push(false);
        });
        self.ticketList.push(response);
        // self.ticketId = undefined;
        self.newTicketStatus.push(true);
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'newTicketStatus', data: this.newTicketStatus, id: modelData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: ticketID, id: modelData.id });
        self.loader.hide();
      }, (error) => {
        console.error(error);
        self.loader.hide();
      })
    } else {
      let isExists = this.ticketList.findIndex(t => t.id === ticketID);
      if (isExists !== -1) {
        if (currentIndex == isExists) {
          setTimeout(() => {
            this.messageService.showMessage('Ticket already assigned', 'info');
          }, 1);

        } else {
          //open that ticket
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: ticketID, id: modelData.id });
          this.messageService.showMessage('Ticket already exists', 'info');
        }
      }
      this.loader.hide();
    }
  }

  public newTicket(activityData, ticketType?: any, errorType?: any, year?: any, id?: any) {
    const self = this;
    let ticketDetails: any = {};
    let isExists;
    let customerTickets;
    let normalFlow = false;
    let json = {
      "customerId": activityData.customerId
    }
    self.loader.show();
    this.commonApiService.getPromiseResponse({ apiName: APINAME.SEARCH_TICKET_FOR_ACTIVITY, parameterObject: json, showLoading: false }).then((result) => {
      customerTickets = result;
      self.loader.hide();
      if (ticketType.department == 'Sales' || ticketType.department == 'Setup' || ticketType.department == 'Renew') {
        isExists = customerTickets.findIndex(obj => (obj.department === ticketType.department
          && obj.year === year));

        if (isExists > -1) {
          let deptYear = { 'department': ticketType.department, 'year': year };
          let existingTickets = customerTickets.filter(obj => (obj.department == ticketType.department && obj.year == year));
          let data = { 'availableSetupTickets': existingTickets, 'ticketExists': true, 'deptYear': deptYear }

          this.dialogService.custom(TicketSetupComponent, data, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
            (response) => {
            }, (error) => {
              console.error(error);
            });


        } else {
          normalFlow = true;
        }
      } else {
        normalFlow = true;
      }
      if (normalFlow) {
        self.loader.show();
        this.commonApiService.getPromiseResponse({ apiName: APINAME.GENERATE_NEW_TICKET_NUMBER, showLoading: false }).then((response) => {
          ticketDetails = response;
          self.loader.hide();
          if (ticketDetails.ticketStatus === undefined || ticketDetails.ticketStatus === null || ticketDetails.ticketStatus === '') {
            ticketDetails.ticketStatus = '0';
          }

          if (ticketType && ticketType.id) {
            ticketDetails.typeId = ticketType.id;
          }
          ticketDetails.subType = [];
          for (let type of errorType) {
            ticketDetails.subType.push({ 'id': type.id.toString(), 'text': type.name, 'knowledgeBase': type.knowledgeBase });
          }
          if (ticketType && ticketType.fieldList) {
            ticketDetails.typeFieldDefinition = { fields: ticketType.fieldList };
          } else {
            ticketDetails.typeFieldDefinition = { fields: [] };
          }
          if (year) {
            ticketDetails.year = year;
          }
          if (ticketType.department) {
            ticketDetails.department = ticketType.department
          }
          self.changeDeptOrYearOfActivity(activityData, ticketType.department, year);

          if (ticketDetails.subType && ticketDetails.subType.length > 0) {
            isExists = customerTickets.findIndex(obj => (obj.department === ticketDetails.department
              && obj.year === ticketDetails.year
              && obj.typeId === ticketDetails.typeId
              && obj.subType === ticketDetails.subType));
          } else {
            isExists = customerTickets.findIndex(obj => (obj.department === ticketDetails.department
              && obj.year === ticketDetails.year
              && obj.typeId === ticketDetails.typeId));
          }
          if (isExists !== -1) {
            this.messageService.showMessage('Ticket already exists', 'error');
          }
          self.ticketList.forEach(element => {
            self.newTicketStatus.push(false);
          });
          self.ticketList.push(ticketDetails);

          // self.ticketId = undefined;
          self.newTicketStatus.push(true);
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: id });
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'newTicketStatus', data: this.newTicketStatus, id: id });
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: id });
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'currentTicketIndex', data: this.ticketList.length - 1, id: id });

        });
      }
    }, (error) => {
      console.error(error);
    })
  }

  /**
     * Called to change Department / Tax Year of activity
     * @param dept 
     * @param year 
     */
  public changeDeptOrYearOfActivity(activityData, dept?: any, year?: any) {
    if (activityData && activityData.length > 0) {
      if ((activityData.department !== dept) || (activityData.taxSeason !== year)) {
        const dialogData = { title: 'Change Department/Tax Season', text: 'Tax Season/Department for Ticket (You just created) are different from the Activity fields. Do you want to use the same for Activity?' };
        this.dialogService.confirm(dialogData, {}).result.then((result) => {
          if (result == 'YES') {
            activityData.department = dept;
            activityData.taxSeason = year;
            this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'activityData', data: activityData, id: activityData.id });
          }
        })
      }
    }
  }


  isSaveDataValid(saveObject, isTicketActivityValid): boolean {
    let isValidDataToSave = true;
    for (const key in isTicketActivityValid) {
      if (isTicketActivityValid.hasOwnProperty(key)) {
        if (!isTicketActivityValid[key]) {
          isValidDataToSave = false;
        }
      }
    }

    if (isValidDataToSave) {
      return true;
    } else {
      if (saveObject.preserveNotSavedticketList && saveObject.preserveNotSavedticketList.length === 0) {
        this.messageService.showMessage('Please Link Ticket to the Activity', 'error');
      } else {
        this.messageService.showMessage('Mandatory data needs to be filled', 'error');
      }
      return false
    }
  }


  /**
  * @author Sheo Ouseph
  * @createdDate 15/11/2019
  * @description saves ticket activity data
  * @memberof TicketActivityDetailService
  */
  public saveData(saveObject: any, isTicketActivityValid?, windowData?, id?, setupTrainingObj?) {

    let isValidDataToSave = this.isSaveDataValid(saveObject, isTicketActivityValid)

    if (isValidDataToSave) {
      let finalSaveObject;
      let isInvalidSpecialTask = false;
      if (saveObject.requestType === '1On1SetupTraining') {
        finalSaveObject = {};
        finalSaveObject = this.prepareSaveObject(saveObject);
        finalSaveObject.trainingStatus = setupTrainingObj.status;
        finalSaveObject.cancelReason = setupTrainingObj.reason;
        finalSaveObject.windowId = windowData.windowId;
        this.updateActivityForTrainingSetup(finalSaveObject);
      } else {
        finalSaveObject = this.prepareSaveObject(saveObject);
        if (saveObject.timePeriod && saveObject.timePeriod.startDate && saveObject.timePeriod.endDate) { // check if enddate is greater than startdate
          let startdate = new Date(moment(saveObject.timePeriod.startDate).format());
          let startDate = moment(startdate).format('YYYY-MM-DD');
          let enddate = new Date(moment(saveObject.timePeriod.endDate).format());
          let endDate = moment(enddate).format('YYYY-MM-DD');
          if (startDate && endDate && (moment(startDate).format('YYYY-MM-DD') > moment(endDate).format('YYYY-MM-DD'))) {
            isInvalidSpecialTask = true;
            this.messageService.showMessage("'Task End Time should be greater than Task Start Time.'", 'error');
          } else {
            isInvalidSpecialTask = false;
          }
        }
        if (!isInvalidSpecialTask && finalSaveObject) {
          this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_NEW_ACTIVITY_TICKET, parameterObject: finalSaveObject, showLoading: true }).then((response) => {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'changesSaved', data: true, id: windowData.id });
            if (this.ticketList && this.ticketList.length > 0) {
              for (let obj of this.ticketList) {
                if (!obj.id) {
                  obj.id = response.ticketId
                }
                break;
              }
              this.activityData.ticketList = this.ticketList;
            }

            for (let i = 0; i < this.newTicketStatus.length; i++) {
              this.newTicketStatus[i] = false;
            }
            this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'newTicketStatus', data: this.newTicketStatus });

            if (saveObject.requestType === 'Save' || saveObject.requestType === 'Draft' || saveObject.requestType === 'Cancel') {
              if (windowData && windowData.screen === 'activity') {
                this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
                this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-tab-customer', topic: 'activityCustomer', data: {} });
              }
              else {
                this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'changesSaved', data: true, id: windowData.id });
                this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
                this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-tab-customer', topic: 'ticketCustomer', data: {} });
              }
            } else if (saveObject.requestType === 'Email') {
              const data = { 'activityId': 'ACT_' + this.activityData.id };
              this.commonApiService.getPromiseResponse({ apiName: APINAME.SEND_EMAIL, parameterObject: data, showLoading: true }).then((response1) => {
                if (response) {
                  this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'changesSaved', data: true, id: windowData.id });
                  this.ticketActivityOverlayService.closeWindow(windowData.windowId, this.activityData.id);
                  this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-tab-customer', topic: 'activityCustomer', data: {} });

                }
              }, error => {
                console.error(error);
              });
            } else {
              this.redirectToMainFunction(saveObject, isTicketActivityValid, windowData, id);
            }
          });
        }
      }
    }
  }



  public saveTicketDetails(ticketDetails: any, from?, windowData?, id?) {
    let saveObject = this.prepareTicketSaveObject(ticketDetails);
    if (ticketDetails.id || (saveObject.activityId && saveObject.activityId.length > 0)) {
      this.loader.show();
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_TICKET_DETAILS, parameterObject: saveObject, showLoading: false }).then(response => {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'changesSaved', data: true, id: windowData.currentId });
        this.loader.hide();
        if (from === 'ticket-activity-detail') {
          if (saveObject && saveObject.ticketDetails && saveObject.ticketDetails.requestType && (saveObject.ticketDetails.requestType === 'Next' || saveObject.ticketDetails.requestType === 'Prev')) {
            saveObject['requestType'] = saveObject.ticketDetails.requestType;
            windowData['id'] = windowData.windowId;
            windowData['screen'] = 'ticket';
            this.redirectToMainFunction(saveObject, undefined, windowData, id, undefined);
          } else {
            this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.currentId);
          }
        } else {
          let ticketID = response;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'customerID', data: this.activityData.customerId, id: windowData.currentId })

          let index = this.ticketList.findIndex(t => t.ticketNumber === ticketDetails.ticketNumber);
          if (index > -1) {
            this.ticketList[index].id = ticketID;
            this.ticketList[index] = Object.assign(this.ticketList[index], ticketDetails)
          }

          if (saveObject.activityId && saveObject.activityId.length > 0) {
            this.messageService.showMessage('Ticket saved & assigned to activity successfully', 'success');
            this.newTicketStatus[index] = false;
          } else if (!this.activityData.id) {
            // && this.activityMode == 'NotAvailable'
            this.messageService.showMessage('Ticket updated successfully', 'success');
          } else {
            this.messageService.showMessage('Ticket updated successfully but not associated with this activity as it is in new mode. In order to associate save activity', 'success');
          }
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'ticketList', data: this.ticketList, id: windowData.currentId });
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'newTicketStatus', data: this.newTicketStatus, id: windowData.currentId });
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: ticketID, id: windowData.currentId });

        }

      }, error => {
        console.error(error);
        this.loader.hide();
        this.messageService.showMessage('Error occured while saving ticket', 'error');
      });
    } else {
      this.messageService.showMessage('Ticket can\'t associate with this activity as it is in new mode. In order to associate save activity', 'error');
    }
  }

  public prepareTicketSaveObject(ticketDetails: any) {
    let data: any = new Object();
    if (ticketDetails.activityId) {
      if (ticketDetails.activityId.length > 0) {
        data.activityId = ticketDetails.activityId;
        let id = this.activityData.id;
        if (data.activityId && id) {
          let isActivityIdExists = data.activityId.findIndex(val => val === id);
          if (isActivityIdExists === -1) {
            data.activityId.push(this.activityData.id);
          }
        } else if (id) {
          data.activityId = [id]
        } else {
          data.activityId = [];
        }
      } else {
        data.activityId = [];
      }
    } else {
      if (this.activityData.id) {
        data.activityId = [this.activityData.id];
      } else {
        data.activityId = [];
      }
    }
    data.currentActivityId = this.activityData.id;
    data.ticketId = ticketDetails.id;
    data.customerId = this.activityData.customerId;
    const self = this;
    // execute when ticket is added
    if (ticketDetails !== undefined && Object.keys(ticketDetails).length > 0) {
      if (ticketDetails.ticketStatus !== undefined && ticketDetails.ticketStatus !== null && self.lookup.ticketStatusList) {
        let ticketStatusObject = _.find(self.lookup.ticketStatusList, function (o) { return o.id == ticketDetails.ticketStatus; });
        if (ticketStatusObject) {
          ticketDetails.ticketStatusText = ticketStatusObject.name;
        }
      }

      if (ticketDetails.subType && ticketDetails.subType.length > 0) {
        for (let type of ticketDetails.subType) {
          if (type.id == '1') {
            type.otherDesc = ticketDetails.errorTypeOtherDesc
            break;
          }
        }
      }

      if (ticketDetails.errorTypeArray && ticketDetails.errorTypeArray.length > 0) {
        ticketDetails.subType = [];
        let typeIndex = this.lookup.typeDefinationDetails[ticketDetails.department.toLowerCase()].findIndex(t => t.id == ticketDetails.typeId)
        for (let type of ticketDetails.errorTypeArray) {
          if (typeIndex > -1) {
            let subTypeIndex = this.lookup.typeDefinationDetails[ticketDetails.department.toLowerCase()][typeIndex].subTypeList.findIndex(t => t.id == type)
            if (subTypeIndex > -1) {
              ticketDetails.subType.push({ id: type, text: this.lookup.typeDefinationDetails[ticketDetails.department.toLowerCase()][typeIndex].subTypeList[subTypeIndex].name })
            }
          }

        }
      }

      ticketDetails.resolutionText = [];
      if (ticketDetails.resolution !== undefined && ticketDetails.resolution !== null && ticketDetails.resolution.length > 0 && self.lookup.resolutionList) {
        for (let i = 0; i < ticketDetails.resolution.length; i++) {
          let ticketResolutionObject = _.find(self.lookup.resolutionList, function (o) { return ticketDetails.resolution[i] == o.id; });
          ticketDetails.resolutionText.push(ticketResolutionObject.name);
        }
      }
      ticketDetails.outcomeText = [];
      if (ticketDetails.outcome !== undefined && ticketDetails.outcome !== null && ticketDetails.outcome.length > 0 && self.lookup.outComeTypeList) {
        for (let i = 0; i < ticketDetails.outcome.length; i++) {
          let ticketoutcomeObject = _.find(self.lookup.outComeTypeList, function (o) { return ticketDetails.outcome[i] == o.id; });
          if (ticketoutcomeObject) {
            ticketDetails.outcomeText.push(ticketoutcomeObject.name);
          }
        }
      }
      if (ticketDetails.typeId !== undefined && ticketDetails.typeId !== null && self.lookup.typeDefinationDetails) {
        let ticketTypeObject = _.find(self.lookup.typeDefinationDetails[ticketDetails.department.toLowerCase()], function (o) { return ticketDetails.typeId == o.id; });
        if (ticketTypeObject) {
          ticketDetails.typeText = ticketTypeObject.name;
        }
      }

      if (ticketDetails.typeId !== undefined && ticketDetails.typeId !== null && this.lookup.typeDefinationDetails) {
        let ticketTypeObject = _.find(this.lookup.typeDefinationDetails[ticketDetails.department.toLowerCase()], function (o) { return ticketDetails.typeId == o.id; });
        if (ticketTypeObject) {
          ticketDetails.typeText = ticketTypeObject.name;
          ticketDetails.typeFieldDefinition = {
            "errorType": ticketTypeObject.subTypeList,
            "fields": ticketTypeObject.fieldList
          };
        }
      }
      // if (ticketDetails && ticketDetails.typeFieldDefinition && ticketDetails.typeFieldDefinition.fields) {
      //   for (let fields of ticketDetails.typeFieldDefinition.fields) {
      //     if (fields.model) {
      //       ticketDetails.typeFieldDetails[fields.model] = fields.default;
      //     } else {
      //       ticketDetails.typeFieldDetails[fields.name] = fields.value;
      //     }

      //   }
      // }
    }
    if (ticketDetails !== undefined && ticketDetails !== null && _.size(ticketDetails) > 0) {
      if (ticketDetails.errorTypeLater == undefined || ticketDetails.errorTypeLater == false) {
        ticketDetails.errorTypeLater = false;
      }
      data.ticketDetails = ticketDetails;
    } else {
      ticketDetails = {};
      data.ticketDetails = {};
    }
    return data;
  }


  redirectToMainFunction(saveObject, isTicketActivityValid?, windowData?, id?, setupTrainingObj?) {

    let currentWindow: any;
    for (let obj in this.ticketActivityOverlayService.clientIdsObject) {
      if (this.ticketActivityOverlayService.clientIdsObject[obj].currentId == this.activityData.id) {
        currentWindow = obj;
        break;
      }
    }
    let dialogData: any;

    switch (saveObject.requestType) {
      case 'Email':
        this.sendEmail(saveObject, isTicketActivityValid, windowData);
        break;
      case 'CallToEmail':
        this.ticketActivityOverlayService.closeWindow(currentWindow, this.activityData.id);
        this.setPastTicketActivityDataStore({ IsChangedEditModeValue: 'CallToEmail', pastActivityData: JSON.parse(JSON.stringify(this.activityData)) });
        dialogData = {
          IsChangedEditModeValue: 'CallToEmail',
          screen: 'activity',
          tempId: Math.random().toString(36).substr(2, 16),
          pastActivityData: this.activityData,
        };
        this.ticketActivityOverlayService.openWindow(dialogData);
        break;
      case 'EmailToCall':
        this.ticketActivityOverlayService.closeWindow(currentWindow, this.activityData.id);
        saveObject.from = this.userService.getUserDetail().userEmail.toLowerCase();
        this.setPastTicketActivityDataStore({ IsChangedEditModeValue: 'EmailToCall', pastActivityData: JSON.parse(JSON.stringify(saveObject)) });
        dialogData = {
          IsChangedEditModeValue: 'EmailToCall',
          screen: 'activity',
          tempId: Math.random().toString(36).substr(2, 16),
          pastActivityData: this.activityData,
        };
        this.ticketActivityOverlayService.openWindow(dialogData);
        break;
      case 'Reply':
        this.activityData.information = saveObject.activityDetails.information ? saveObject.activityDetails.information : this.activityData.information;
        this.activityData.to = saveObject.activityMailDetails.to ? saveObject.activityMailDetails.to : this.activityData.to;
        this.activityData.cc = saveObject.activityMailDetails.cc ? saveObject.activityMailDetails.cc : this.activityData.cc;
        this.activityData.bcc = saveObject.activityMailDetails.bcc ? saveObject.activityMailDetails.bcc : this.activityData.bcc;
        this.activityData.bcc = saveObject.activityMailDetails.bcc ? saveObject.activityMailDetails.bcc : this.activityData.bcc;
        this.activityData.subject = saveObject.activityDetails.subject ? saveObject.activityDetails.subject : this.activityData.subject;
        this.activityData.information = '<br><br>-------------------------------------------------------------' +
          '<br>From:' + this.activityData.from + '<br>To: ' +
          this.activityData.to + ' ' + ((this.activityData.cc !== undefined && this.activityData.cc !== '') ? '<br>CC: ' + this.activityData.cc : '') + '' +
          ((this.activityData.bcc !== undefined && this.activityData.bcc !== '') ? '<br>Bcc: ' + this.activityData.bcc : '') + '<br>Sent: ' +
          this.formattedCreatedDate + '<br>Subject: ' + this.activityData.subject + ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br><br>' + this.activityData.information : '');
        this.activityData.subject = 'Re : ' + this.activityData.subject;
        this.activityData.status_value = '0';
        if (this.ticketList && this.ticketList.length > 0) {
          this.activityData.ticketList = this.ticketList;
        }
        this.ticketActivityOverlayService.closeWindow(currentWindow, this.activityData.id);
        this.setPastTicketActivityDataStore({ IsChangedEditModeValue: 'Reply', pastActivityData: JSON.parse(JSON.stringify(this.activityData)) });
        dialogData = {
          IsChangedEditModeValue: 'Reply',
          screen: 'activity',
          tempId: Math.random().toString(36).substr(2, 16),
          activityTypeSelectedMainType: this.activityData.screen,
          activityTypeSelectedKey: this.activityData.type,
          activityTypeSelectedOption: this.activityData.direction,
          pastActivityData: this.activityData,
        };
        this.ticketActivityOverlayService.openWindow(dialogData);
        break;
      case 'Forward':
        this.activityData.information = saveObject.activityDetails.information ? saveObject.activityDetails.information : this.activityData.information;
        this.activityData.to = saveObject.activityMailDetails.to ? saveObject.activityMailDetails.to : this.activityData.to;
        this.activityData.from = saveObject.activityMailDetails.from ? saveObject.activityMailDetails.from : this.activityData.from;
        this.activityData.cc = saveObject.activityMailDetails.cc ? saveObject.activityMailDetails.cc : this.activityData.cc;
        this.activityData.bcc = saveObject.activityMailDetails.bcc ? saveObject.activityMailDetails.bcc : this.activityData.bcc;
        this.activityData.bcc = saveObject.activityMailDetails.bcc ? saveObject.activityMailDetails.bcc : this.activityData.bcc;
        this.activityData.subject = saveObject.activityDetails.subject ? saveObject.activityDetails.subject : this.activityData.subject;

        this.activityData.information = '<br><br>-------------------------------------------------------------' +
          '<br>From:' + this.activityData.from + '<br>To: ' +
          this.activityData.to + ' ' + ((this.activityData.cc !== undefined && this.activityData.cc !== '') ? '<br>CC: ' + this.activityData.cc : '') + '' +
          ((this.activityData.bcc !== undefined && this.activityData.bcc !== '') ? '<br>Bcc: ' + this.activityData.bcc : '') + '<br>Sent: ' + this.formattedCreatedDate + '<br>Subject: ' + this.activityData.subject +
          ((this.activityData.information !== undefined && this.activityData.information !== '') ? '<br><br>' + this.activityData.information : '');

        this.activityData.subject = 'Fw : ' + this.activityData.subject;
        this.activityData.status_value = '0';
        if (this.ticketList && this.ticketList.length > 0) {
          this.activityData.ticketList = this.ticketList;
        }
        this.ticketActivityOverlayService.closeWindow(currentWindow, this.activityData.id);
        this.setPastTicketActivityDataStore({ IsChangedEditModeValue: 'Forward', pastActivityData: JSON.parse(JSON.stringify(this.activityData)) });
        dialogData = {
          IsChangedEditModeValue: 'Forward',
          screen: 'activity',
          tempId: Math.random().toString(36).substr(2, 16),
          activityTypeSelectedMainType: this.activityData.screen,
          activityTypeSelectedKey: this.activityData.type,
          activityTypeSelectedOption: this.activityData.direction,
          pastActivityData: this.activityData,
        };
        this.ticketActivityOverlayService.openWindow(dialogData);
        break;
      case 'FollowUp':
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'FollowUp', data: 'FollowUp', id: this.activityData.id });
        break;
      case '1On1SetupTraining':
      case 'Draft':
      case 'Save':
        this.saveData(saveObject, isTicketActivityValid, windowData, undefined, setupTrainingObj);
        break;
      case 'Next':
      case 'Prev':
        this.ticketActivityOverlayService.nextPrevious(windowData.windowId, windowData.id, saveObject.requestType, windowData.screen);
        break;
      case 'CustActNext':
      case 'CustActPrev':
      case 'CustActSelection':
        this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-action', topic: 'CustActChangeSelection', data: saveObject.requestType, id: windowData.id });
        break;
      case 'TicActNext':
      case 'TicActPrev':
      case 'TicActSelection':
        this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-action', topic: 'TicActChangeSelection', data: saveObject.requestType, id: windowData.id });
        break;
      case 'CustTicSelection':
        this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-action', topic: 'CustTicChangeSelection', data: saveObject.requestType, id: windowData.id });
        break;
      case 'OpenActivityInNewTab':
        this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
        window.open('/#/detail-view/activity/details/' + id, '_blank');
        break;
      case 'OpenTicketInNewTab':
        this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
        window.open('/#/detail-view/ticket/details/' + id, '_blank');
        break;
      default:
        this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
        break;
    }
  }


  /**
  * this function is used to send email to the user
  */
  public sendEmail(saveObject, isTicketActivityValid?, windowData?): void {
    let emailList = [];
    for (const obj of this.lookup.responsiblePersonList) {
      if (obj.email !== '') {
        emailList.push({ id: obj.email.toString(), name: obj.email.toLowerCase() });
      }
    }
    let emailListIds = emailList.map(t => t.id)
    const index = emailListIds.indexOf(saveObject.activityData.to.toLowerCase());
    if (index !== -1) {   //  if (_.findIndex(this.emailList, function (o) { return o['id'].toLowerCase() == this.activityData.to.toLowerCase(); }) != -1) {
      const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to send email to ' + saveObject.activityData.to + '?' };
      this.dialogService.confirm(dialogData, {}).result.then((result) => {
        if (result === 'YES') {
          if (saveObject.activityData.id) {
            this.saveData(saveObject, isTicketActivityValid, windowData);
          } else {// Create Activity and Send EMail
            this.createAndSendMail(saveObject, isTicketActivityValid, windowData);
          }
        }
      }, (error) => {
        console.error(error);
      });
    } else {
      if (saveObject.activityData.id) {
        this.saveData(saveObject, isTicketActivityValid, windowData);
      } else {// Create Activity and Send EMail
        this.createAndSendMail(saveObject, isTicketActivityValid, windowData);
      }
    }
  }


  public createAndSendMail(saveObject, isTicketActivityValid?, windowData?): void {
    let isValidDataToSave = this.isSaveDataValid(saveObject, isTicketActivityValid); // check whether form is valid or not
    if (isValidDataToSave) {
      let finalSaveObject = this.prepareSaveObject(saveObject);

      this.commonApiService.getPromiseResponse({ apiName: APINAME.CREATE_AND_SEND_MAIL, parameterObject: finalSaveObject, showLoading: true }).then((response) => {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity', topic: 'changesSaved', data: true, id: windowData.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-tab-customer', topic: 'activityCustomer', data: {} });
        this.ticketActivityOverlayService.closeWindow(windowData.windowId, windowData.id);
      }, error => {
        if (error && error.code == 4041) {
          this.messageService.showMessage(error.messageKey, 'error');
        }
        console.error(error);
      });
    }
  };


  /**
   * @author Sheo Ouseph
   * @createdDate 15/11/2019
   * @description prepares object for saving the data for ticket activity
   * @updatedBy Dhruvi Shah
   * @description get activityData from params and bind value 
   * @memberof TicketActivityDetailService
   */
  public prepareSaveObject(saveObject) {
    let finalSaveObject: any = {};
    // console.log(JSON.stringify(this.ticketList));

    // assigning data from the ta customer component to save object
    finalSaveObject = Object.assign(finalSaveObject, saveObject.customerInfo);
    delete finalSaveObject.userPhoneNumber;


    if ((saveObject.preserveNotSavedticketList && saveObject.preserveNotSavedticketList.length > 0) || (saveObject && saveObject.activityData && saveObject.activityData.department && saveObject.activityData.department == 'Management')) {

      // if ((this.ticketList !== undefined || Object.keys(this.ticketList).length > 0 || saveObject.activityData.department === 'Support') || saveObject.activityData.department === 'Sales' || saveObject.activityData.department === 'Setup' || saveObject.activityData.department === 'Renew') {
      if (saveObject.activityData.id) {
        finalSaveObject.ID = 'ACT_' + this.activityData.id;
        finalSaveObject.createdBy = this.activityData.createdBy;
        finalSaveObject.updatedBy = this.userService.getUserDetail().id;
      } else {
        finalSaveObject.createdBy = this.userService.getUserDetail().id;
      }

      finalSaveObject.isTest = saveObject.isTest;
      finalSaveObject.feedback = saveObject.activityData.feedback;
      finalSaveObject.customerId = saveObject.activityData.customerId;
      finalSaveObject.screen = saveObject.activityData.screen;
      finalSaveObject.type = saveObject.activityData.type;
      finalSaveObject.direction = saveObject.activityData.direction;
      finalSaveObject.datetime = saveObject.activityHeader.datetime;
      finalSaveObject.plannedDateTime = saveObject.activityHeader.plannedDateTime;
      finalSaveObject.subject = saveObject.activityDetails && saveObject.activityDetails.subject ? saveObject.activityDetails.subject : this.activityData.subject;
      finalSaveObject.from = saveObject.activityMailDetails && saveObject.activityMailDetails.from ? saveObject.activityMailDetails.from : this.activityData.from;
      if (saveObject.activityData.screen === 'email') {
        finalSaveObject.to = saveObject.activityMailDetails && saveObject.activityMailDetails.to ? saveObject.activityMailDetails.to : this.activityData.to;
        finalSaveObject.cc = saveObject.activityMailDetails && saveObject.activityMailDetails.cc ? saveObject.activityMailDetails.cc : this.activityData.cc;
        finalSaveObject.bcc = saveObject.activityMailDetails && saveObject.activityMailDetails.bcc ? saveObject.activityMailDetails.bcc : this.activityData.bcc;
      } else {
        finalSaveObject.to = '';
        finalSaveObject.cc = '';
        finalSaveObject.bcc = '';
      }



      // if user selects 'Draft' option and activity status is set as 'new', then change the status from 'new' to 'draft'
      if (saveObject.requestType === 'Draft' && finalSaveObject.status_value === '0' && finalSaveObject.screen === 'email') {
        finalSaveObject.status_value = '10';
      }

      this.clsActivityServiceStatusLookupData = [];
      for (const obj of this.lookup.activityStatusList) {
        this.clsActivityServiceStatusLookupData.push({ id: obj.id.toString(), name: obj.name });
      }

      // here we have to pass both value and text for status and responsible
      const statusCurrentIndex = this.clsActivityServiceStatusLookupData ? this.clsActivityServiceStatusLookupData.findIndex(t => t.id === saveObject.activityHeader.status_value) : -1;
      if (statusCurrentIndex !== -1) {
        finalSaveObject.status = this.clsActivityServiceStatusLookupData[statusCurrentIndex].name;
      }
      finalSaveObject.status_value = saveObject.activityHeader.status_value;
      finalSaveObject.responsiblePerson_value = saveObject.activityDetails && saveObject.activityDetails.responsiblePerson_value ? saveObject.activityDetails.responsiblePerson_value : saveObject.activityData.responsiblePerson_value;

      // here we have to pass both value and text for status and responsible  //TODO
      const responsibleCurrentIndex = this.lookup.responsiblePersonList.findIndex(t => t.id === finalSaveObject.responsiblePerson_value);

      if (responsibleCurrentIndex !== -1) {
        finalSaveObject.responsiblePerson = this.lookup.responsiblePersonList[responsibleCurrentIndex].name;
      }

      if (saveObject.orderDetails !== undefined && saveObject.orderDetails.commissionReceiver !== undefined) {
        // here we have to pass both value and text for status and responsible //TODO
        const responsibleCurrentIndex = this.lookup.responsiblePersonList.findIndex(obj => obj.id == saveObject.orderDetails.commissionReceiver);
        if (responsibleCurrentIndex !== -1) {
          saveObject.orderDetails.commissionReceiver = this.lookup.responsiblePersonList[responsibleCurrentIndex].id;
          saveObject.orderDetails.commissionReceiver_Name = this.lookup.responsiblePersonList[responsibleCurrentIndex].name;
        }
        finalSaveObject.orderDetails = saveObject.orderDetails;
      } else {
        finalSaveObject.orderDetails = {};
      }
      finalSaveObject.priority = saveObject.activityHeader.priority;
      finalSaveObject.taxSeason = saveObject.activityHeader.taxSeason;
      finalSaveObject.salesProcessStatus = finalSaveObject.salesProcessStatus;
      finalSaveObject.department = saveObject.activityHeader.department;
      finalSaveObject.information = saveObject.activityDetails && saveObject.activityDetails.information ? saveObject.activityDetails.information : saveObject.activityData.information;
      finalSaveObject.contactPerson = finalSaveObject.contactPerson;
      if (saveObject.documentList.length > 0) {
        if (saveObject.activityData.id) {
          finalSaveObject.documentList = saveObject.documentList;
        } else {
          finalSaveObject.tempActivityId = saveObject.documentList[0].tempId;
        }
      } else {
        finalSaveObject.documentList = [];   // for checking only 
      }

      if (saveObject.activityData.tagList && saveObject.activityData.tagList.length > 0) {
        saveObject.activityData.tagList.forEach(data => {
          delete data.isNewlyAdded;
        });

        finalSaveObject.tagList = saveObject.activityData.tagList;  // for now only checking
        const isBanktag = finalSaveObject.tagList.findIndex(obj => obj.id == 6);
        if (isBanktag !== -1) {
          finalSaveObject.BPVolumeDetails = saveObject.BPVolumeDetails;
        } else {
          finalSaveObject.BPVolumeDetails = {};
        }
        const isSystemIssue = finalSaveObject.tagList.findIndex(obj => obj.group == 'SystemIssue');
        if (isSystemIssue !== -1 || saveObject.activityData.type === 'meeting') {
          finalSaveObject.timePeriod = saveObject.timePeriod;
        } else {
          finalSaveObject.timePeriod = {};
        }
      } else {
        finalSaveObject.BPVolumeDetails = {};
        finalSaveObject.timePeriod = {};
      }

      if (finalSaveObject.BPVolumeDetails !== undefined && finalSaveObject.BPVolumeDetails !== null && finalSaveObject.BPVolumeDetails.unknown == true) {
        finalSaveObject.BPVolumeDetails.volume = 'unknown';
      } else if (finalSaveObject.BPVolumeDetails !== undefined && finalSaveObject.BPVolumeDetails !== null && finalSaveObject.BPVolumeDetails.volume !== undefined) {
        finalSaveObject.BPVolumeDetails.volume = finalSaveObject.BPVolumeDetails.volume;
      }

      const self = this;
      let ticketDetails: any = [];
      let resolutionText: any = [];
      // excute when ticket is added
      if (saveObject.preserveNotSavedticketList && saveObject.preserveNotSavedticketList.length > 0) {

        for (let i = 0; i < saveObject.preserveNotSavedticketList.length; i++) {
          saveObject.ticketDetails = saveObject.preserveNotSavedticketList[i];

          if (saveObject.ticketDetails) {
            saveObject.ticketDetails.createdBy = this.activityData.createdBy;
            saveObject.ticketDetails.createdByName = this.activityData.createdByName;
            saveObject.ticketDetails.createdDate = this.activityData.createdDate;
            saveObject.ticketDetails.customerId = this.activityData.customerId;
            saveObject.ticketDetails.customerInfo = this.activityData.customerInfo;
            saveObject.ticketDetails.updatedBy = this.userService.getUserDetail().id;
            saveObject.ticketDetails.updatedByName = this.userService.getUserDetail().userName;
            saveObject.ticketDetails.updatedDate = moment(new Date()).tz('America/New_York').format('MM/DD/YY hh:mm A');
            saveObject.ticketDetails.department = saveObject.preserveNotSavedticketList[i].department;
            saveObject.ticketDetails.year = saveObject.preserveNotSavedticketList[i].year;

            let ticketStatusObject = _.find(this.lookup.ticketStatusList, function (o) { return o.id == saveObject.ticketDetails.ticketStatus; });
            if (ticketStatusObject) {
              saveObject.ticketDetails.ticketStatusText = ticketStatusObject.name;
            }
            if (saveObject.ticketDetails.subType && saveObject.ticketDetails.subType.length > 0) {
              for (let type of saveObject.ticketDetails.subType) {
                if (type.id == '1') {
                  break;
                }
              }
            }
            if (saveObject.ticketDetails.errorTypeArray && saveObject.ticketDetails.errorTypeArray.length > 0) {
              saveObject.ticketDetails.subType = [];
              let typeIndex = this.lookup.typeDefinationDetails[saveObject.ticketDetails.department.toLowerCase()].findIndex(t => t.id == saveObject.ticketDetails.typeId)
              for (let type of saveObject.ticketDetails.errorTypeArray) {
                if (typeIndex > -1) {
                  let subTypeIndex = this.lookup.typeDefinationDetails[saveObject.ticketDetails.department.toLowerCase()][typeIndex].subTypeList.findIndex(t => t.id == type)
                  if (subTypeIndex > -1) {
                    saveObject.ticketDetails.subType.push({ id: type, text: this.lookup.typeDefinationDetails[saveObject.ticketDetails.department.toLowerCase()][typeIndex].subTypeList[subTypeIndex].name })
                  }
                }

              }
            }
            if (saveObject.ticketDetails.resolution !== undefined && saveObject.ticketDetails.resolution !== null && saveObject.ticketDetails.resolution.length > 0 && this.lookup.resolutionList) {
              for (let i = 0; i < saveObject.ticketDetails.resolution.length; i++) {
                let ticketResolutionObject = _.find(this.lookup.resolutionList, function (o) { return saveObject.ticketDetails.resolution[i] == o.id; });
                resolutionText.push(ticketResolutionObject.name);
              }
              saveObject.ticketDetails.resolutionText = resolutionText;
            }
            let outcomeText = [];
            if (saveObject.ticketDetails.outcome !== undefined && saveObject.ticketDetails.outcome !== null && saveObject.ticketDetails.outcome.length > 0 && this.lookup.outComeTypeList) {
              for (let i = 0; i < saveObject.ticketDetails.outcome.length; i++) {
                let ticketoutcomeObject = _.find(this.lookup.outComeTypeList, function (o) { return saveObject.ticketDetails.outcome[i] == o.id; });
                if (ticketoutcomeObject) {
                  outcomeText.push(ticketoutcomeObject.name);
                }
              }
              saveObject.ticketDetails.outcomeText = outcomeText;
            }
            if (saveObject.ticketDetails.typeId !== undefined && saveObject.ticketDetails.typeId !== null && this.lookup.typeDefinationDetails) {
              let ticketTypeObject = _.find(this.lookup.typeDefinationDetails[saveObject.ticketDetails.department.toLowerCase()], function (o) { return saveObject.ticketDetails.typeId == o.id; });
              if (ticketTypeObject) {
                saveObject.ticketDetails.typeText = ticketTypeObject.name;
                saveObject.ticketDetails.typeFieldDefinition = {
                  "errorType": ticketTypeObject.subTypeList,
                  "fields": saveObject.ticketDetails.typeFieldDefinition.fields
                };
              }
            }

            for (var key in saveObject.ticketDetails) {
              if (saveObject.ticketDetails[key] === null) {
                delete saveObject.ticketDetails[key];
              }
            }

            if (saveObject.ticketDetails !== undefined && saveObject.ticketDetails !== null && _.size(saveObject.ticketDetails) > 0) {
              ticketDetails.push(saveObject.ticketDetails);
            }

          }
        }


      }

      finalSaveObject.ticketDetails = ticketDetails;
      finalSaveObject = Object.assign(finalSaveObject);
      return finalSaveObject;
    }
    else {
      this.messageService.showMessage('Please Link Ticket to the Activity', 'error');
      return false;
    }

  }

  public deleteTag(parameterObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_TAG, parameterObject: { "tagList": parameterObject.deletedTagData }, showLoading: false }).then(
        response => {
          if (response) {
            resolve(this.lookup);
          } else {
            reject();
          }

        }, error => {
          reject(error);
        }
      );
    });
  }

  // cancel or setup training data when activity type is set to '1on1SetupTraining'
  public updateActivityForTrainingSetup(finalSaveObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_ACTIVITY_FOR_TRAINING_SETUP, parameterObject: finalSaveObject }).then((response) => {
        if (response) {
          this.messageService.showMessage('1on1 Setup Training Planner Status Updated Successfully', 'success');
        }
        this.ticketActivityOverlayService.closeWindow(finalSaveObject.windowId, this.activityData.id);
      }, error => {
        this.messageService.showMessage('Error Occur while updating the Status for 1on1 Setup Training Planner ', 'error');
      });
    });
  }

}
