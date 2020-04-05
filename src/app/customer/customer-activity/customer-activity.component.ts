// External imports
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, ViewChildren, QueryList } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import * as moment from 'moment-timezone';
import { NgSelectComponent } from "@ng-select/ng-select";
import { Subscription } from 'rxjs';

// Internal imports
import { CustomerActivityService } from "@app/customer/customer-activity/customer-activity.service";
import { UserService, CDRService, DialogService, MessageService } from '@app/shared/services';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { ActivitySearchDetailsService } from '@app/activity/activity-search/activity-search-details.service';
import { ActivityNewComponent } from '@app/activity/dialog/activity-new/activity-new.component';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';

@Component({
  selector: 'app-customer-activity',
  templateUrl: './customer-activity.component.html',
  styleUrls: ['./customer-activity.component.scss'],
  providers: [CustomerActivityService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CustomerActivityComponent implements OnInit {

  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;
  @Input() customerID: string;
  public customerActivitySearchForm: FormGroup;
  public customerActivitySearchLookup: any = {};
  public activitySearchLookup: any = {};

  //grid related variables
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public openActivityCount: any;
  public showfeedback: boolean;
  public customerResellerId;
  public rowData;
  public columnDefs: any;
  public getRowHeight;
  public getRowStyle;
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  public rowClassRules: any;
  public gridHighlightWatcher: Subscription;
  public arrayListWatcher: Subscription;
  public closeActivityWatcher: Subscription;
  public activityTabCustomer: Subscription;
  // Title Header Data Relataed
  public userResellerId = '';
  showBlacklistIcon: Boolean = false;
  isDoNotCall: boolean = false;
  public opendedActivities = [];
  public lastOpenedActivity = '';
  public isEmailIn: boolean = false;  // to set flag true when screen is email and direction is in
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  private integrityServiceSubscription: Subscription;

  constructor(private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService,
    private dialogService: DialogService,
    private customerActivityService: CustomerActivityService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private activitySearchDetailsService: ActivitySearchDetailsService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) {
    this.columnDefs = [
      {
        headerName: '', field: 'hasDocument', suppressMovable: true, suppressMenu: true, width: 40, lockPosition: true,
        cellRenderer: params => {
          if (params.value == 'true') {
            return ` <img title="Attachment" style="width: 16px; float: left;padding-top:5px"  src="assets/images/attechment_icon.png">`
          }
        }
      },
      {
        headerName: '', field: 'salesProcessStatus', suppressMovable: true, suppressMenu: true, width: 40, lockPosition: true,
        cellRenderer: params => {
          if (params.value == 'BlackListed') {
            return `<i class="fas fa-ban cursor-pointer text-danger font-15" data-action-type="blacklisted" title="Blacklisted"></i>`
            // return `<img style="cursor: pointer;" data-action-type="blacklisted" height="20px" width="20px" alt="Blacklisted" title="Blacklisted" src="assets/images/blacklisted.png">`
          }
        }
      },
      {
        headerName: 'Contact',
        headerTooltip: 'Contact',
        field: 'contactPersonName',
        tooltipField: 'contactPersonName',
        width: 140,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: 'Type',
        headerTooltip: 'Type',
        field: 'type',
        filter: true,
        width: 120,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        tooltipValueGetter: params => {
          return params.data.type + '-' + params.data.direction
        },
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          return params.data.type + '-' + params.data.direction
        }
      },
      {
        headerName: 'Subject',
        headerTooltip: 'Subject',
        field: 'subject',
        tooltipField: 'subject',
        filter: true,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellStyle: { cursor: "pointer" }
      },
      {
        headerName: 'Responsible',
        headerTooltip: 'Responsible',
        tooltipField: 'responsiblePerson',
        field: 'responsiblePerson',
        filter: true,
        width: 160,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellStyle: { cursor: "pointer" },

      },
      {
        headerName: 'P',
        headerTooltip: 'Priority',
        field: 'priority_value',
        filter: true,
        width: 60,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellRenderer: params => {
          switch (params.data.priority) {
            case 'Immediate':
              return `<img style="cursor: pointer;padding-bottom:8px;" height = "20px" width = "25px" alt = "Immediate" title = "Immediate" src = "assets/images/priority_immediate.gif" >`
            case 'High':
              return `<img style="cursor: pointer;padding-bottom:8px;" height = "20px" width = "25px" alt = "High" title = "High" src = "assets/images/priority_high.gif" >`
            case 'Normal':
              return `<img style="cursor: pointer;padding-bottom:8px;" height = "20px" width = "25px" alt = "Normal" title = "Normal" src = "assets/images/priority_normal.gif" >`
            case 'Low':
              return `<img style="cursor: pointer;padding-bottom:8px;" height = "20px" width = "25px" alt = "Low" title = "Low" src = "assets/images/priority_low.gif" >`
            default:
              break;
          }
        }
      },
      {
        headerName: 'Stauts', headerTooltip: 'Status', field: 'status', tooltipField: 'status',
        filter: true, width: 130, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" }
      },
      {
        headerName: 'Planned', headerTooltip: 'Planned DateTime', field: 'plannedDateTime', tooltipField: 'plannedDateTimeTitle',
        filter: true, width: 155, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if (params.value) {
            return moment(params.value).format('MM/DD/YY hh:mm A')
          }
        }
      },
      {
        headerName: 'Actual', headerTooltip: 'Actual Datetime', field: 'datetime', tooltipField: 'datetimeTimeTitle', sort: 'desc',
        filter: true, width: 155, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if (params.value) {
            return moment(params.value).format('MM/DD/YY hh:mm A')
          }
        }
      },
      {
        headerName: 'T. Number', headerTooltip: 'Ticket Number', field: 'ticketNumber', tooltipField: 'ticketNumber', type: 'numericColumn',
        filter: true, width: 100, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" }
      },
      {
        headerName: 'T. Type', headerTooltip: 'Ticket Type', field: 'typeText', filter: true, tooltipField: 'typeText',
        width: 200, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" }
      },
      {
        headerName: 'Sub-Type', headerTooltip: 'Sub-Type', field: 'errorTypeText', tooltipField: 'errorTypeText',
        filter: true, width: 140, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" }
      },
      {
        headerName: 'T. Status', headerTooltip: 'Ticket Status', field: 'ticketStatusText', tooltipField: 'ticketStatusText',
        filter: true, width: 90, lockPosition: true, suppressMenu: true, sortable: true, cellStyle: { cursor: "pointer" }
      },
    ];

    this.domLayout = "autoHeight";
    this.getRowHeight = function (params) {
      if (params.node.data) {
        var a = 26;
        return a;
      }
    };
    this.getRowStyle = (params) => {
      if (params.data.priority === 'Immediate') {
        return { 'background-color': '#fcafaf' };
      } else if (params.data.priority === 'High') {
        return { 'background-color': '#fbfcaf' };
      } else if (params.data.isCurrentRefundRequest === true) {
        return { 'background-color': '#ADD8E6' };
      } else if (params.data.isRefundRequestDenied === true) {
        return { 'background-color': '#6ba8bc' };
      }
      return null;
    };
    this.rowClassRules = {
      'highlightSelectedActivity': (params) => {
        // return params.data.id === this.selectedActId
        if (this.opendedActivities && this.opendedActivities.length > 0) {
          for (let index in this.opendedActivities) {
            if (this.opendedActivities[index] === params.data.id) {
              return true;
            }
          }
        } else {
          if (this.lastOpenedActivity == params.data.id) {
            return true;
          }

        }
      },
    };
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "goToCustomerCart":
          this.goToCustomerCart(e.data.customerId);
        default:
          this.checkActivityAlreadyOpenOrNot(e); // display toster if activity is alrday open and show in maximized window
      }
    }
  }

  getClass(context: any) {
    let selectedActId;
    for (let index in this.opendedActivities) {
      if (this.opendedActivities[index] === context.data.id) {
        selectedActId = context.data.id;
      }
    }

    if (selectedActId && context.data.id == selectedActId) {
      if (context.data.priority == 'Immediate') {
        return { 'background-color': '#fcafaf', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data.priority == 'High') {
        return { 'background-color': '#fbfcaf', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data.isCurrentRefundRequest == true) {
        return { 'background-color': '#ADD8E6', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data.isRefundRequestDenied == true) {
        return { 'background-color': '#6ba8bc', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      }
    }
    else {
      if (context.data.priority == 'Immediate') {
        return { 'background-color': '#fcafaf' }
      } else if (context.data.priority == 'High') {
        return { 'background-color': '#fbfcaf' }
      } else if (context.data.isCurrentRefundRequest == true) {
        return { 'background-color': '#ADD8E6' }
      } else if (context.data.isRefundRequestDenied == true) {
        return { 'background-color': '#6ba8bc' }
      }
      else
        return null;
    }
  }




  onSortChanged(): void {
    const filteredActivityArray = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      filteredActivityArray.push(node.data);
    });
    if (this.opendedActivities && this.opendedActivities.length > 0) {
      for (const actId of this.opendedActivities) {
        this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, filteredActivityArray);
      }
    } else {
      this.ticketActivityOverlayService.preserveGridData(filteredActivityArray);
    }
  }

  goToCustomerCart(customerId): void {
    window.open('/#/customer/edit/' + customerId, '_blank');
  };


  /**
  * @author Manali Joshi
  * @createdDate 17-01-2019
  * @description this function is used to check activity is open already in current tab
  * @param {*} id
  * @memberof ActivityOrderComponent
  */
  checkActivityAlreadyOpenOrNot(e) {
    let isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'activity')
    if (!isOpen) {
      this.opendedActivities.push(e.data.id);
      this.lastOpenedActivity = undefined;
      this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
    }
    this.gridApi.redrawRows();
  }


  /**
  * @author Manali Joshi
  * @createdDate 10/1/2020
  * @param {*}  inputvalue
  * @memberof ActivitySearchComponent
  */
  filterData(eventTarget) {
    this.customerActivitySearchLookup.responsiblePesronList = this.rpLookupDataForFilter;
    this.customerActivitySearchLookup.responsiblePesronList = this.customerActivitySearchLookup.responsiblePesronList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.CDRService.callDetectChanges(this.cdr);
  }


  newActivity() {

    this.dialogService.custom(ActivityNewComponent, {}, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
      (response) => {
        if (response !== 'NO') {      // Open window as dialog
          let dialogData = {
            screen: 'activity',
            customerId: this.customerID,
            tempId: Math.random().toString(36).substr(2, 16),
            activityTypeSelectedKey: response.activityTypeSelectedKey,
            activityTypeSelectedOption: response.activityTypeSelectedOption,
            activityTypeSelectedMainType: response.activityTypeSelectedMainType,
          };
          this.ticketActivityOverlayService.openWindow(dialogData);
        }
      }, (error) => {
        console.error(error);
      });
  }

  /**
    * @author Dhruvi Shah
    * @createdDate 23-10-2019
    * @memberof ActivitySearchComponent
    */
  public initCustomerActivitySearchForm() {
    this.customerActivitySearchForm = this.fb.group({
      responsiblePersonResult: [],
      activityTypeResult: [],
      activitystatusResult: [],
      tagListResult: [],
      department: [],
      dateFrom: '',
      dateTo: '',
      freeText: '',
      actsWithoutTicket: null
    })
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    }
    else {
      params.api.sizeColumnsToFit();
    }
  }
  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description get lookup val
   * @memberof ActivitySearchComponent
   */
  public getLookupForCustomerActivity() {
    const self = this;
    self.customerActivityService.getLookupForCustomerActivity().then(
      (response: any) => {
        this.customerActivitySearchLookup.tagListLkp = response.tagListLkp;
        this.customerActivitySearchLookup.activityTypelist = response.activityTypelist;
        this.customerActivitySearchLookup.activitystatuslist = response.activitystatuslist;
        this.customerActivitySearchLookup.responsiblePesronList = response.responsiblePesronList;
        this.rpLookupDataForFilter = response.responsiblePesronList; // for group filter
        this.search();
      },
      error => {
        console.error(error);
      }
    );
  }
  /**
 * @author Dhruvi Shah
 * @createdDate  05/12/2019
 * @description get lookup val
 * @memberof CustomerTicketComponent
 */
  public getDepartmentLookUp() {
    const self = this;
    self.customerActivityService.getDepartmentLookUp().then(
      (response: any) => {
        this.customerActivitySearchLookup.departmentList = response;
      },
      error => {
        console.error(error);
      }
    );
  }

  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "responsiblePersonResult":
        selected = [];
        selected = this.customerActivitySearchLookup.responsiblePesronList.map(
          item => item.id
        );
        this.customerActivitySearchForm.get("responsiblePersonResult").patchValue(selected);
        break;
      case "activityTypeResult":
        selected = [];
        selected = this.customerActivitySearchLookup.activityTypelist.map(
          item => item.id
        );
        this.customerActivitySearchForm.get("activityTypeResult").patchValue(selected);
        break;
      case "activitystatusResult":
        selected = [];
        selected = this.customerActivitySearchLookup.activitystatuslist.map(
          item => item.id
        );
        this.customerActivitySearchForm.get("activitystatusResult").patchValue(selected);
        break;
      case "tagListResult":
        selected = [];
        selected = this.customerActivitySearchLookup.tagListLkp.map(
          item => item.id
        );
        this.customerActivitySearchForm.get("tagListResult").patchValue(selected);
        break;
      case "department":
        selected = [];
        selected = this.customerActivitySearchLookup.departmentList.map(
          item => item.id
        );
        this.customerActivitySearchForm.get("department").patchValue(selected);
        break;
    }
  }

  public onClearAll(clearSelectfor?: string) {
    this.customerActivitySearchLookup.responsiblePesronList = this.rpLookupDataForFilter;
    if (this.customerActivitySearchForm && clearSelectfor) {
      this.customerActivitySearchForm.get(clearSelectfor).patchValue([]);
    }
  }

  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  public clearSearchData() {
    this.customerActivitySearchForm.reset();
    this.onDateChange();
    this.search();
  }

  public onDateChange() {
    setTimeout(() => {
      this.CDRService.callDetectChanges(this.cdr);
    }, 100);
  }

  public search() {
    let reqParam: any = {};
    const activityTypeValue = [];
    if (this.customerActivitySearchForm) {
      if (this.customerActivitySearchForm.get('activityTypeResult').value && this.customerActivitySearchForm.get('activityTypeResult').value.length > 0) {
        this.customerActivitySearchForm.get('activityTypeResult').value.filter(obj => { activityTypeValue.push({ id: obj }); });
      }
      reqParam.activityType = activityTypeValue;
      reqParam.activityTypeResult = this.customerActivitySearchForm.get('activityTypeResult').value ? this.customerActivitySearchForm.get('activityTypeResult').value : [];
      const activitystatusValue = [];
      if (this.customerActivitySearchForm.get('activitystatusResult').value && this.customerActivitySearchForm.get('activitystatusResult').value.length > 0) {
        this.customerActivitySearchForm.get('activitystatusResult').value.filter(obj => { activitystatusValue.push({ id: obj }); });
      }
      reqParam.activitystatus = activitystatusValue;
      reqParam.activitystatusResult = this.customerActivitySearchForm.get('activitystatusResult').value ? this.customerActivitySearchForm.get('activitystatusResult').value : [];
      //reqParam.activityTypeResult.push({'id':value})
      const responsiblePersonValue = [];
      if (this.customerActivitySearchForm.get('responsiblePersonResult').value && this.customerActivitySearchForm.get('responsiblePersonResult').value.length > 0) {
        this.customerActivitySearchForm.get('responsiblePersonResult').value.filter(obj => { responsiblePersonValue.push({ id: obj }); });
      }
      reqParam.responsiblePersonResult = this.customerActivitySearchForm.get('responsiblePersonResult').value ? this.customerActivitySearchForm.get('responsiblePersonResult').value : [];
      reqParam.responsiblePerson = [];
      reqParam.responsiblePerson.push({'id' : reqParam.responsiblePersonResult.toString()});

      reqParam.department = [];
      if (this.customerActivitySearchForm.get('department').value && this.customerActivitySearchForm.get('department').value.length > 0) {
        this.customerActivitySearchForm.get('department').value.filter(obj => { reqParam.department.push({ id: obj }); });
      }
      // reqParam.department = this.customerActivitySearchForm.get('department').value ? this.customerActivitySearchForm.get('department').value : [];

      reqParam.sortDirection = "desc";
      reqParam.sortExpression = "datetime";
      reqParam.customerID = this.customerID;
      reqParam.pageNo = "1";
      reqParam.pageSize = "500";
      reqParam.dateFrom = this.customerActivitySearchForm.get('dateFrom').value;
      reqParam.dateTo = this.customerActivitySearchForm.get('dateTo').value;
      reqParam.freeText = this.customerActivitySearchForm.get('freeText').value;
      reqParam.actsWithoutTicket = this.customerActivitySearchForm.get('actsWithoutTicket').value;
      const tagListResultValue = [];
      if (this.customerActivitySearchForm.get('tagListResult').value && this.customerActivitySearchForm.get('tagListResult').value.length > 0) {
        this.customerActivitySearchForm.get('tagListResult').value.filter(obj => { responsiblePersonValue.push({ id: obj }); });
      }
      reqParam.tagListResult = this.customerActivitySearchForm.get('tagListResult').value ? this.customerActivitySearchForm.get('tagListResult').value : [];
      reqParam.tagList = [];
      reqParam.tagList.push({'id' : reqParam.tagListResult.toString()});
      this.customerActivityService.getCustomerActivitySearch(reqParam).then((response: any) => {
        response.forEach(element => {
          if (element.plannedDateTime) {
            element.plannedDateTime = moment(element.plannedDateTime, 'MM/DD/YY hh:mm A').utc().format();
            element.plannedDateTimeTitle = moment(element.plannedDateTime).format('MM/DD/YY hh:mm A')

          }
          if (element.datetime) {
            element.datetime = moment(element.datetime, 'MM/DD/YY hh:mm A').utc().format();
            element.datetimeTimeTitle = moment(element.datetime).format('MM/DD/YY hh:mm A')
          }
        });
        this.rowData = response;
        if (this.opendedActivities && this.opendedActivities.length > 0) {
          for (const actId of this.opendedActivities) {
            this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, this.rowData);
          }
        } else {
          this.ticketActivityOverlayService.preserveGridData(this.rowData);
        }
        if (response !== undefined && response.length > 0) {
          this.openActivityCount = response[0].openActCount;
        } else {
          this.openActivityCount = 0;
        }
        this.CDRService.callDetectChanges(this.cdr);
      });
    }
  }
  public getCustomerActivitySearchData() {
    let reqParam: any = {};
    reqParam.activityType = [];
    reqParam.activityTypeResult = [];
    reqParam.activitystatus = [];
    reqParam.activitystatusResult = [];
    //reqParam.activityTypeResult.push({'id':value})
    reqParam.customerID = this.customerID;
    reqParam.pageNo = "1";
    reqParam.pageSize = "50";
    reqParam.responsiblePerson = [];
    reqParam.responsiblePersonResult = [];
    reqParam.sortDirection = "desc";
    reqParam.sortExpression = "datetime";
    reqParam.tagList = [];
    reqParam.tagListResult = [];

    this.customerActivityService.getCustomerActivitySearch(reqParam).then((response: any) => {
      this.rowData = response;
      if (response !== undefined && response.length > 0) {
        this.openActivityCount = response[0].openActCount;
      } else {
        this.openActivityCount = 0;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.showfeedback = this.userService.showFeedback();
    this.getLookupForCustomerActivity();
    this.getDepartmentLookUp();
    this.initCustomerActivitySearchForm();

    this.activityTabCustomer = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.channel === 'activity-tab-customer' && msgObj.topic === 'activityCustomer') {
        this.search();
      }
    });

    if (this.localStorageUtilityService.checkLocalStorageKey("openActivityTabLocalStorageData")) {
      const minimizedActivityIds = this.localStorageUtilityService.getFromLocalStorage("openActivityTabLocalStorageData");
      if (minimizedActivityIds && minimizedActivityIds.length > 0) {
        for (const obj of minimizedActivityIds) {
          this.opendedActivities.push(obj.screen == 'activity' ? obj.activityId : obj.ticketId);
          this.lastOpenedActivity = undefined;
          this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
        }
      }
    }

    if (this.localStorageUtilityService.checkLocalStorageKey("lastOpenedID")) {
      this.lastOpenedActivity = this.localStorageUtilityService.getFromLocalStorage("lastOpenedID");
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.redrawRows();
        }
      }, 3000);
    }


    /**
  * subscribe event to get minimized activity when activity close and
  * redraw grid to remove highlighted class
  */
    this.gridHighlightWatcher = this.ticketActivityOverlayService.gridHighlight.subscribe((result: any) => {
      if (result) {
        let index = this.opendedActivities.findIndex(openId => openId === result.prev);
        if (index > -1) {
          this.opendedActivities.splice(index, 1);
        }
        this.opendedActivities.push(result.current);
        this.lastOpenedActivity = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
        if (this.gridApi) {
          this.gridApi.redrawRows();
        }

      }
    });

    this.arrayListWatcher = this.ticketActivityOverlayService.arrayList.subscribe((result: any) => {
      let opendedActivitiesFromHeader = result.list.map((openActivity: any) => openActivity.id);
      if (opendedActivitiesFromHeader.length !== this.opendedActivities.length && result.type !== 'maximized') {
        if (this.opendedActivities && this.opendedActivities.length == 1 && (!opendedActivitiesFromHeader || opendedActivitiesFromHeader.length == 0)) {
          if (this.regexForGUID.test(this.opendedActivities[0])) {
            this.lastOpenedActivity = this.opendedActivities[0];
            this.localStorageUtilityService.addToLocalStorage('lastOpenedID', this.lastOpenedActivity);
          }

        }
        this.opendedActivities = opendedActivitiesFromHeader;
      }
      if (this.opendedActivities && this.opendedActivities.length > 0) {
        this.lastOpenedActivity = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
      }
      if (this.gridApi) {
        this.gridApi.redrawRows();
      }
    });

    /**
    * subscribe event to get activityId when activity close and
    * call fun to remove id from clientIdsObject
    */

    this.closeActivityWatcher = this.ticketActivityOverlayService.closeActivityId.subscribe((closeActivityId: any) => {
      this.activitySearchDetailsService.removeClientIdsOnClose(closeActivityId);
      if (this.opendedActivities && this.opendedActivities.length > 0) {
        let i = this.opendedActivities.findIndex(openActivityId => openActivityId === closeActivityId);
        if (i > -1) {
          this.opendedActivities.splice(i, 1);
        }
        if (!this.opendedActivities || this.opendedActivities.length == 0) {
          if (this.regexForGUID.test(closeActivityId)) {
            this.lastOpenedActivity = closeActivityId;
            this.localStorageUtilityService.addToLocalStorage('lastOpenedID', this.lastOpenedActivity);
          }
        }
        if (this.gridApi) {
          this.gridApi.redrawRows();
        }
      }
    });

    this.integrityServiceSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.channel === 'close_window') {
        setTimeout(() => {
          this.search();
        }, 500);
      }
    });

  }

  ngOnChanges() {
    if (this.customerID) {
      this.search();
    }
  }

  ngOnDestroy() {
    if (this.gridHighlightWatcher) {
      this.gridHighlightWatcher.unsubscribe();
    }
    if (this.arrayListWatcher) {
      this.arrayListWatcher.unsubscribe();
    }
    if (this.activityTabCustomer) {
      this.activityTabCustomer.unsubscribe();
    }
    if (this.closeActivityWatcher) {
      this.closeActivityWatcher.unsubscribe();
    }
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }
}
