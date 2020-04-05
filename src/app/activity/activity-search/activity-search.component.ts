// External Imports
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { ColDef, _ } from "ag-grid-community";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';

// Internal Imports
import { UserService, CDRService, LocalStorageUtilityService, DialogService } from '@app/shared/services';
import { ActivitySearchService } from '@app/activity/activity-search/activity-search.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { ActivitySearchDetailsService } from '@app/activity/activity-search/activity-search-details.service';
import { MessageService } from '@app/shared/services/message.service';
import { WindowService } from '@progress/kendo-angular-dialog';
import { SaveNewFilterDialogComponent } from '@app/shared/dialogue/save-new-filter-dialog/save-new-filter-dialog.component';
//import { ChangeCustomerComponent } from '@app/shared/dialogue/change-customer/change-customer.component';
import { ChangeActivityStatusComponent } from '@app/shared/dialogue/change-activity-status/change-activity-status.component';
import { PostalChannelService } from '@app/shared/services/postChannel.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';
import { ChangeCustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/change-customer/change-customer.component';

@Component({
  styleUrls: ['./activity-search.component.scss'],
  templateUrl: './activity-search.component.html',
  providers: [ActivitySearchService],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivitySearchComponent implements OnInit, OnDestroy {

  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;

  public activitySearchForm: FormGroup;
  public availableActivity: { data: any; total: any };
  public rowData: any = [];
  public defaultColDef: any;
  public getRowStyle: any;
  public rowClassRules: any;
  public sideBar: any;
  public gridApi;
  public showLoading: boolean;
  public gridColumnApi;
  public columnDefs: ColDef[];
  public userDetails: any = {};
  public isDefaultReseller: any = {};
  public isSearchDisable: boolean;
  public showfeedback: boolean;
  public customerResellerId;
  public activitySearchLookup: any = {};
  public updateCreateDate: boolean = false;
  public test = [];
  public opendedActivities = [];
  public lastOpenedActivity = '';
  public filteredActivityArray = [];
  public SearchCriteriaList: any;
  public selectedActivities = [];
  public selectedActId;
  public gridHighlightWatcher: Subscription;
  public arrayListWatcher: Subscription;
  public closeActivityWatcher: Subscription;
  //activity popup header related changes
  public selectedCustomerId = '';
  public userResellerId = '';
  public activityCustomerFinalInformation;
  public activityData: any = {};
  public customerData: any = {};
  public activitySearch: any = {};
  showBlacklistIcon: Boolean = false;
  isDoNotCall: boolean = false;
  public activitysearchData: any;
  public returnFullResult: boolean;
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  public isEmailIn: boolean = false;  // to set flag true when screen is email and direction is in
  // public windowTitleBar;
  // to fetch india-support team filter criteria
  public filterResponsiblePerson: any = [];
  public responsiblePersonArray = [];
  public resetResposiblePersonList = [];
  private integrityServiceSubscription: Subscription;
  private preserveSearchCriteria: any;
  private preserveLocalStorageData: any;
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private activitySearchService: ActivitySearchService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService,
    private windowService: WindowService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private activitySearchDetailsService: ActivitySearchDetailsService,
    private messageService: MessageService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private dialogService: DialogService,
    private postalChannelService: PostalChannelService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) {

    this.columnDefs = [
      {
        headerName: "",
        field: "customerId",
        cellRenderer: params => {
            if (params.data && params.data.resellerId !== undefined && params.data.resellerId == '4dc601df-dc0e-4a7a-857d-9493ba33a223') {
              let element = ` <img style="cursor: pointer;padding-left:0px;padding-right:0px;" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) " src="assets/images/Angebot.png">`
              return element;
            } else if (params.data && params.data.resellerId !== undefined && params.data.resellerId != this.customerResellerId) {
              let element = `<i class="fas fa-exclamation-triangle text-danger" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) "></i>`
              // let element = ` <img style="cursor: pointer;padding-left:0px;padding-right:0px;" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) " src="assets/images/warning-original-16x16.png">`
              return element;
          }  
        },
        width: 25,
        sortable: false,
        cellClass: 'ag-icons-wrap',
        tooltip: (p: any) => {
          // return 'Go to customer(Reseller:' + p.data.resellerName + ')';
          return '';
        }
      },
      {
        headerName: '', field: 'hasDocument', suppressMovable: true, suppressMenu: true, width: 25, cellClass: 'ag-icons-wrap',
        cellRenderer: params => {
          if (params.value == 'true') {
            return ` <img title="Attachment" class="font-15 cursor-pointer float-left"  style="padding-left:0px;padding-right:0px;padding-top:5px;"  src="assets/images/attechment_icon.png">`
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: '', field: 'salesProcessStatus', suppressMovable: true, suppressMenu: true, width: 25, cellClass: 'ag-icons-wrap',
        cellRenderer: params => {
          if (params.value == 'BlackListed') {
            return `<i class="fas fa-ban cursor-pointer text-danger font-15" data-action-type="blacklisted" title="Blacklisted"></i>`
            // return `<img style="cursor: pointer;padding-left:0px;padding-right:0px;" data-action-type="blacklisted" height="20px" width="20px" alt="Blacklisted" title="Blacklisted" src="assets/images/blacklisted.png">`
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: '',
        field: 'isSelected',
        width: 30,
        headerCheckboxSelection: (params) => {
          return params.api.gridOptionsWrapper.gridOptions.rowData[0].isSelected === true;
        },
        checkboxSelection: (params) => {
          if(params.node && params.node.data)
          {
            return params.node.data.isSelected === true;
          }  
        },
        cellRenderer: (params) => {
          return '';
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: "Company Name",
        field: "customerName",
        headerTooltip: "Company Name",
        filter: "agTextColumnFilter",
        width: 160,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "S",
        field: "state",
        headerTooltip: "State",
        filter: "agTextColumnFilter",
        width: 65,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Sales Process Status",
        field: "salesProcessStatus",
        headerTooltip: "Sales Process Status",
        filter: "agTextColumnFilter",
        width: 130,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Contact",
        field: "contactPersonName",
        headerTooltip: "Contact",
        filter: "agTextColumnFilter",
        width: 100,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Type",
        field: "type",
        headerTooltip: "Type",
        filter: "agTextColumnFilter",
        width: 100,
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if(params.data){
            return params.data.type + '-' + params.data.direction
          }
        },
      },
      {
        headerName: "Subject",
        field: "subject",
        headerTooltip: "Subject",
        filter: "agTextColumnFilter",
        width: 150,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Responsible",
        field: "responsiblePerson",
        headerTooltip: "Responsible",
        filter: "agTextColumnFilter",
        width: 90,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: 'P', headerTooltip: "Priority", field: 'priority_value', suppressMovable: true,
        suppressMenu: true, width: 50,
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          switch (params.data && params.data.priority) {
            case 'Immediate':
              return `<img style="cursor: pointer;padding-bottom: 6px;" height = "25px" width = "25px" alt = "Immediate" title = "Immediate" src = "assets/images/priority_immediate.gif" >`
            case 'High':
              return `<img style="cursor: pointer;padding-bottom: 6px;" height = "25px" width = "25px" alt = "High" title = "High" src = "assets/images/priority_high.gif" >`
            case 'Normal':
              return `<img style="cursor: pointer;padding-bottom: 6px;" height = "25px" width = "25px" alt = "Normal" title = "Normal" src = "assets/images/priority_normal.gif" >`
            case 'Low':
              return `<img style="cursor: pointer;padding-bottom: 6px;" height = "25px" width = "25px" alt = "Low" title = "Low" src = "assets/images/priority_low.gif" >`
            default:
              break;
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: "Status",
        field: "status",
        headerTooltip: "Status",
        filter: "agTextColumnFilter",
        width: 100,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Planned",
        field: "plannedDateTime",
        headerTooltip: "Planned",
        tooltipField: 'plannedDateTimeTitle',
        filter: "agTextColumnFilter",
        width: 140,
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if (params.value) {
            return moment(params.value).format('MM/DD/YY hh:mm A')
          }
        }
      },
      {
        headerName: "Actual",
        field: "datetime",
        headerTooltip: "Actual Datetime",
        tooltipField: 'datetimeTimeTitle',
        filter: "agTextColumnFilter",
        width: 140,
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if (params.value) {
            return moment(params.value).format('MM/DD/YY hh:mm A')
          }
        }
      },
      {
        headerName: "Ticket Type",
        field: "typeText",
        headerTooltip: "Ticket Type",
        filter: "agTextColumnFilter",
        width: 100,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Sub-Type",
        field: "errorTypeText",
        headerTooltip: "Sub-Type",
        filter: "agTextColumnFilter",
        width: 130,
        cellStyle: { cursor: "pointer" },
      },
      {
        headerName: "Ticket Status",
        field: "ticketStatusText",
        headerTooltip: "Ticket Status",
        filter: "agTextColumnFilter",
        width: 100,
        cellStyle: { cursor: "pointer" },
      }
    ];
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      resizable: true,
      tooltip: (p: any) => {
        return p.value;
      },
      // suppressMenu: true,
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true,
      enableBrowserTooltips: true
    };

    this.sideBar = {
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel"
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel"
        }
      ]
    };
    this.getRowStyle = (context) => {
      return this.getClass(context)
    };
    this.rowClassRules = {
      'highlightSelectedActivity': (params) => {
        // return params.data.id === this.selectedActId
        if (params && params.data) {
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
        }
      },
    };
  }


  /**
   * @author Manali Joshi
   * @createdDate 10/1/2020
   * @param {*}  inputvalue
   * @memberof ActivitySearchComponent
   */
  filterData(eventTarget) {
    this.activitySearchLookup.responsiblePesronList = this.rpLookupDataForFilter;
    this.activitySearchLookup.responsiblePesronList = this.activitySearchLookup.responsiblePesronList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 24/10/2019
   * @param {*} params
   * @memberof ActivitySearchComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    }
    else {
      params.api.sizeColumnsToFit();
    }
  };

  onDateChange() {
    setTimeout(() => {
      this.CDRService.callDetectChanges(this.cdr);
    }, 100);
  }

  /**
  * @author om kanada
  * divided response data in to chunk on sorting or filter change.
  * @memberof ActivitySearchComponent
  */
  onSortChanged(): void {
    this.filteredActivityArray = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      this.filteredActivityArray.push(node.data);
    });
    if (this.opendedActivities && this.opendedActivities.length > 0) {
      for (const actId of this.opendedActivities) {
        this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, this.filteredActivityArray);
      }
    } else {
      this.ticketActivityOverlayService.preserveGridData(this.filteredActivityArray);
    }
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @param {*} e
   * @memberof ActivitySearchComponent
   */
  public onRowClicked(e) {
    if(e.data){
      this.selectedCustomerId = e.data.customerId;
      if (e.event.target !== undefined) {
        // this.activitySearchDetailsService.divideInToChunk(e.data.id);
        const actionType = e.event.target.getAttribute("data-action-type");
        switch (actionType) {
          case "goToCustomerCart":
            this.goToCustomerCart(e.data.customerId);
            break;
          default:
            this.checkActivityAlreadyOpenOrNot(e);
        }
      }
    }
  }


  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  getClass(context: any) {
    let selectedActId;
    for (let index in this.opendedActivities) {
      if (context.data && this.opendedActivities[index] === context.data.id) {
        selectedActId = context.data.id;
      }
    }

    if (selectedActId && context.data && context.data.id == selectedActId) {
      if (context.data && context.data.priority == 'Immediate') {
        return { 'background-color': '#fcafaf', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data && context.data.priority == 'High') {
        return { 'background-color': '#fbfcaf', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data && context.data.isCurrentRefundRequest == true) {
        return { 'background-color': '#ADD8E6', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      } else if (context.data && context.data.isRefundRequestDenied == true) {
        return { 'background-color': '#6ba8bc', 'color': 'black !important', 'font-size': '14px', 'font-weight': 'bold;' }
      }
    }
    else {
      if (context.data && context.data.priority == 'Immediate') {
        return { 'background-color': '#fcafaf' }
      } else if (context.data && context.data.priority == 'High') {
        return { 'background-color': '#fbfcaf' }
      } else if (context.data && context.data.isCurrentRefundRequest == true) {
        return { 'background-color': '#ADD8E6' }
      } else if (context.data && context.data.isRefundRequestDenied == true) {
        return { 'background-color': '#6ba8bc' }
      }
      else
        return null;
    }


  }


  /**
  * @author Satyam Jasoliya
  * @createdDate 12-12-2019
  * @description this function is used to check activity is open already in current tab
  * @param {*} id
  * @memberof ActivitySearchComponent
  */
  checkActivityAlreadyOpenOrNot(e) {
    let isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'activity')
    if (!isOpen) {
      this.opendedActivities.push(e.data.id);
      this.lastOpenedActivity = undefined;
      this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
    }
    if(this.gridApi){
      this.gridApi.redrawRows();
    }
  }

  /**
     * @author Dhruvi Shah
     * @createdDate 24-10-2019
     * @memberof ActivitySearchComponent
     */
  public resetFilter() {
    this.activitySearchForm.reset();
    this.availableActivity = undefined;
    this.showDefaultResellerId();
    this.activitySearchForm.controls.responsiblePerson.setValue([this.userDetails.id]);
    this.onDateChange();
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @memberof ActivitySearchComponent
   */
  public clearSearch() {
    this.activitySearchForm.reset();
    this.availableActivity = undefined;
    this.showDefaultResellerId();
    // remove activity Search object from local storage to reset search filters
    this.localStorageUtilityService.removeFromLocalStorage('activitySearchObject');
    this.onDateChange();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description Show Default Reseller
   * @memberof ActivitySearchComponent
   */
  public showDefaultResellerId(): void {
    // if default reseller is not availble
    if (!this.isDefaultReseller) {
      this.activitySearchForm.controls.resellerId.setValue([this.userService.getResellerId()])
      if (this.activitySearchForm.controls.resellerId.value !== undefined && this.activitySearchForm.controls.resellerId.value != null && this.activitySearchForm.controls.resellerId.value !== '') {
        for (const obj of this.activitySearchLookup.resellerList) {
          if (obj.id === this.activitySearchForm.controls.resellerId.value[0]) {
            this.activitySearchForm.controls.resellerName.setValue(obj.name);
          }
        }
      }
    }
    this.CDRService.callDetectChanges(this.cdr);
  };

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description get available activities
   * @memberof ActivitySearchComponent
   */
  public search(data?): void {
    const self = this;
    self.showLoading = true;

    // set serach criteria  to local storage for preserve its state for future
    this.localStorageUtilityService.addToLocalStorage('activitySearchObject', this.activitySearchForm.value);
    let activitysearch = this.activitySearchForm.value;
    if (!data) {
      self.activitySearchService.searchData(activitysearch).then((response: any) => {
        self.availableActivity = response;
        if (response.data && response.data.counter) {
          self.showLoading = false;

          this.dialogService.custom(ConfirmLargedataDialogComponent, { searchdata: activitysearch, counter: this.availableActivity.data.counter, resultLength: this.availableActivity.data.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
            (response) => {
              this.activitysearchData = response;
              this.localStorageUtilityService.addToLocalStorage('activitySearchObject', response);
              self.preserveSearchCriteria = response;
              if (response) {
                this.activitySearchService.searchData(response).then((result: any) => {
                  self.availableActivity = result;
                  this.rowData = result.data;
                  this.rowData.forEach(element => {
                    if (element.plannedDateTime) {
                      element.plannedDateTime = moment(element.plannedDateTime, 'MM/DD/YY hh:mm A').utc().format();
                      element.plannedDateTimeTitle = moment(element.plannedDateTime).format('MM/DD/YY hh:mm A')
                    }
                    if (element.datetime) {
                      element.datetime = moment(element.datetime, 'MM/DD/YY hh:mm A').utc().format();
                      element.datetimeTimeTitle = moment(element.datetime).format('MM/DD/YY hh:mm A')
                    }
                  });
                  self.showLoading = false;
                  if (self.opendedActivities && self.opendedActivities.length > 0) {
                    for (const actId of self.opendedActivities) {
                      self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, self.rowData);
                    }
                  } else {
                    self.ticketActivityOverlayService.preserveGridData(self.rowData);
                  }
                  self.CDRService.callDetectChanges(self.cdr);

                });
              }
            }, (error) => {
              console.error(error);
            }
          );
        } else {
          if (response && response.data) {
            response.data.forEach(element => {
              if (this.activitySearchForm['controls'].isEditMode.value) {
                element.isSelected = true;
              }
            });
            self.preserveSearchCriteria = undefined;
            self.rowData = response.data;
            self.showLoading = false;
            if (self.opendedActivities && self.opendedActivities.length > 0) {
              for (const actId of self.opendedActivities) {
                self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, response.data.length > 0 ? response.data : []);
              }
            } else {
              self.ticketActivityOverlayService.preserveGridData(response.data.length > 0 ? response.data : []);
            }
          }

        }
        self.CDRService.callDetectChanges(self.cdr);
      },
        error => {
          console.log(error);
          self.showLoading = false;
        }
      );
    } else {
      if (self.preserveLocalStorageData) {
        if (self.preserveLocalStorageData.returnFullResult) {
          if (this.preserveSearchCriteria) {
            this.preserveSearchCriteria['returnFullResult'] = true;
          } else {
            activitysearch['returnFullResult'] = true;
          }
        } else {
          if (this.preserveSearchCriteria) {
            this.preserveSearchCriteria['returnFullResult'] = false;
          } else {
            activitysearch['returnFullResult'] = false;
          }
        }
      }
      this.activitySearchService.searchData(this.preserveSearchCriteria ? this.preserveSearchCriteria : activitysearch).then((result: any) => {
        self.availableActivity = result;
        this.rowData = result.data;
        this.rowData.forEach(element => {
          if (element.plannedDateTime) {
            element.plannedDateTime = moment(element.plannedDateTime, 'MM/DD/YY hh:mm A').utc().format();
            element.plannedDateTimeTitle = moment(element.plannedDateTime).format('MM/DD/YY hh:mm A')
          }
          if (element.datetime) {
            element.datetime = moment(element.datetime, 'MM/DD/YY hh:mm A').utc().format();
            element.datetimeTimeTitle = moment(element.datetime).format('MM/DD/YY hh:mm A')
          }
        });
        self.showLoading = false;
        if (self.opendedActivities && self.opendedActivities.length > 0) {
          for (const actId of self.opendedActivities) {
            self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, result.data.length > 0 ? result.data : []);
          }
        } else {
          self.ticketActivityOverlayService.preserveGridData(result.data.length > 0 ? result.data : []);
        }
        self.CDRService.callDetectChanges(self.cdr);

      });
    }
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description get lookup val
   * @memberof ActivitySearchComponent
   */
  public getLookupForActivity() {
    const self = this;
    self.isSearchDisable = true;
    self.activitySearchService.getLookupForActivity().then(
      (response: any) => {
        self.isSearchDisable = false;
        this.activitySearchLookup = response;
        this.rpLookupDataForFilter = response.responsiblePesronList; // for group filter
        this.checkLocalStorage();
        this.CDRService.callDetectChanges(this.cdr);
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @description function call to select all value from lookup
   * @param {string} multipleSelectfor
   * @memberof ActivitySearchComponent
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "createdBy":
        selected = [];
        selected = this.activitySearchLookup.responsiblePesronList.map(
          item => item.id
        );
        this.activitySearchForm.get("createdBy").patchValue(selected);
        break;
      case "shift":
        selected = [];
        selected = this.activitySearchLookup.shiftList.map(
          item => item.id
        );
        this.activitySearchForm.get("shift").patchValue(selected);
        break;
      case "updatedBy":
        selected = [];
        selected = this.activitySearchLookup.responsiblePesronList.map(
          item => item.id
        );
        this.activitySearchForm.get("updatedBy").patchValue(selected);
        break;
      case "year":
        selected = [];
        selected = this.activitySearchLookup.year.map(
          item => item.id
        );
        this.activitySearchForm.get("year").patchValue(selected);
        break;
      case "department":
        selected = [];
        selected = this.activitySearchLookup.departmentlistDetail.map(
          item => item.id
        );
        this.activitySearchForm.get("department").patchValue(selected);
        break;
      case "activityType":
        selected = [];
        selected = this.activitySearchLookup.activityTypelist.map(
          item => item.id
        );
        this.activitySearchForm.get("activityType").patchValue(selected);
        break;
      case "priority":
        selected = [];
        selected = this.activitySearchLookup.priorityList.map(
          item => item.id
        );
        this.activitySearchForm.get("priority").patchValue(selected);
        break;
      case "tagList":
        selected = [];
        selected = this.activitySearchLookup.tagListLkp.map(
          item => item.id
        );
        this.activitySearchForm.get("tagList").patchValue(selected);
        break;
      case "resellerId":
        selected = [];
        selected = this.activitySearchLookup.resellerList.map(
          item => item.id
        );
        this.activitySearchForm.get("resellerId").patchValue(selected);
        break;
      case "salesProcessStatus":
        selected = [];
        selected = this.activitySearchLookup.salesProcessStatusList.map(
          item => item.id
        );
        this.activitySearchForm.get("salesProcessStatus").patchValue(selected);
        break;
      case "preferredLanguage":
        selected = [];
        selected = this.activitySearchLookup.preferredLanguageList.map(
          item => item.id
        );
        this.activitySearchForm.get("preferredLanguage").patchValue(selected);
        break;
      case "responsiblePerson":
        selected = [];
        selected = this.activitySearchLookup.responsiblePesronList.map(
          item => item.id
        );
        this.activitySearchForm.get("responsiblePerson").patchValue(selected);
        break;
      case "activitystatus":
        selected = [];
        selected = this.activitySearchLookup.activitystatuslist.map(
          item => item.id
        );
        this.activitySearchForm.get("activitystatus").patchValue(selected);
        break;
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof ActivitySearchComponent
   */
  public onClearAll(clearSelectfor?: any) {
    this.activitySearchLookup.responsiblePesronList = this.rpLookupDataForFilter;
    if (this.activitySearchForm && clearSelectfor) {
      this.activitySearchForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @description close deop-down
   * @param {NgSelectComponent} select
   * @memberof CustomerSearchComponent
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 24-10-2019
   * @description function call on shift value change and to set shiftStartTime & shiftEndTime
   * @memberof ActivitySearchComponent
   */
  setShiftTimings() {
    let shift = this.activitySearchForm.controls.shift.value;
    for (let obj of this.activitySearchLookup.shiftList) {
      if (shift[0] == obj.id) {
        this.activitySearchForm.controls.shiftStartTime.setValue(obj.startTime);
      }
      if (shift[shift.length - 1] == obj.id) {
        this.activitySearchForm.controls.shiftEndTime.setValue(obj.endTime);
      }
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description function call on form value change
   * @private
   * @memberof ActivitySearchComponent
   */
  private formValueChange() {
    this.activitySearchForm.controls.shift.valueChanges.subscribe((data) => {
      if (data && data.length > 0) {
        this.setShiftTimings();
      }
    });
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @memberof ActivitySearchComponent
   */
  public initActivitySearchForm() {
    this.activitySearchForm = this.fb.group({
      updatedDateFrom: '',
      updatedDateTo: '',
      updatedBy: '',
      createdDateFrom: '',
      createdDateTo: '',
      createdBy: '',
      shift: '',
      isEditMode: false,
      year: [''],
      department: [''],
      priority: [''],
      activityType: [''],
      tagList: [''],
      actsWithoutTicket: null,
      Customer: '',
      customerNumber: '',
      resellerId: [''],
      resellerName: '',
      salesProcessStatus: [''],
      preferredLanguage: [''],
      isTestCustomer: null,
      isCurrentRefundRequest: null,
      isRefundRequestDenied: null,
      freeText: '',
      plannedDateFrom: '',
      dateFrom: '',
      plannedDateTo: '',
      dateTo: '',
      responsiblePerson: [''],
      activitystatus: [''],
      shiftStartTime: '',
      shiftEndTime: '',
    });
    if (this.userDetails.id) {
      this.activitySearchForm.controls.responsiblePerson.setValue([this.userDetails.id]);
    }
    this.formValueChange();
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  // Search Criteria List
  getAllActivitySearchCriteriaList(): void {
    const self = this;
    this.activitySearchService.GetActivitySearchCriteriaList().then(response => {
      self.SearchCriteriaList = response ? response : undefined;
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  // Todo : Remove function when testing done,
  // open dialog for new filter save
  newFilterDialog(): void {
    const self = this;
    // pass search criteria from local storage in data before opening dialog
    if (this.localStorageUtilityService.checkLocalStorageKey('activitySearchObject')) {
      // Todo
      let data = { 'ASearchCriteria': this.localStorageUtilityService.getFromLocalStorage('activitySearchObject'), 'screen': 'activity' };
      this.dialogService.custom(SaveNewFilterDialogComponent, data, { keyboard: true, backdrop: 'static', size: 'md' }).result.then(
        (response) => {
          if (response) {
            self.getAllActivitySearchCriteriaList();
          }
        }, (error) => {
          console.error(error);
        }
      );
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  // when user update exsting filter
  updateFilter(filterID: any, filterName: any): void {
    const self = this;
    if (self.localStorageUtilityService.checkLocalStorageKey('activitySearchObject')) {
      // Open dialog for conformation before Change
      const dialogData = { title: 'Confirmation', text: `Are you sure you want to update ${filterName} filter?<br> Please make sure you have pressed the search button before saving this filter.  ` };
      this.dialogService.confirm(dialogData, {}).result.then(
        (result) => {
          if (result === 'YES') {
            // object with id and new search criteria
            const objectActivitySearchCriteria = { 'id': filterID, 'filterCriteria': self.localStorageUtilityService.getFromLocalStorage('activitySearchObject'), type: 'activity' };
            self.saveActivityFilter(objectActivitySearchCriteria);
          }
        }, (error) => {
          self.messageService.showMessage('Error occurred while processing.', 'error');
        });
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  public saveActivityFilter(param: any): void {
    this.activitySearchService.saveActivityFilter(param).then(response => {
      this.messageService.showMessage('Filter updated successfully', 'success');
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  // Loading Saved Filter
  public loadFilter(filterID: any): void {
    // call api and get search criteria from api
    this.activitySearchService.getActivityFilterByID({ id: filterID }).then((response: any) => {
      if (response && response.ASearchCriteria) {
        this.localStorageUtilityService.addToLocalStorage('activitySearchObject', response['ASearchCriteria']);
        this.activitySearchForm.patchValue(response.ASearchCriteria);
      }
      // after response store that search criteria to local storage. If ASearchCriteria does not exist in response, this will work.
      if (response && !response.ASearchCriteria) {
        this.localStorageUtilityService.addToLocalStorage('activitySearchObject', response);
        this.activitySearchForm.patchValue(response);
      }
      this.search();
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof ActivitySearchComponent
   */
  // to delete filter
  deleteFilter(id, event) {
    const self = this;
    event.preventDefault();
    event.stopPropagation();

    // Open dialog for conformation before Change
    const dialogData = { title: 'Confirmation', text: `Are you sure, you want to delete this filter?` };
    this.dialogService.confirm(dialogData, {}).result.then(
      (result) => {
        if (result === 'YES') {
          this.activitySearchService.deleteSavedActivityFilter({ 'id': id }).then(response => {
            if (response === true) {
              setTimeout(() => {
                self.getAllActivitySearchCriteriaList();
              }, 1000);
              this.messageService.showMessage('Filter is deleted successfully', 'success');
            } else {
              this.messageService.showMessage('Error occured while processing your request.', 'error');
            }
            this.CDRService.callDetectChanges(this.cdr);
          });
        }
      }, (error) => {
        self.messageService.showMessage('Error occured while processing your request.', 'error');
      });
  }

  /**
   * @author Manali Joshi
   * @createdDate 20-12-2019
   * @memberof ActivitySearchComponent
   */
  public downloadExcel() {

    let parameterObj = this.activitySearchForm.value;

    for (const key in parameterObj) {
      if (parameterObj.hasOwnProperty(key) && (!parameterObj[key])) {
        delete parameterObj[key];
      }
    }
    let responsiblePersonValue = this.activitySearchForm.value.responsiblePerson;
    let responsiblePerson = [];
    for (const responsiblePersonId of responsiblePersonValue) {
      responsiblePerson.push({ id: responsiblePersonId });
    }
    parameterObj.pageNo = 1;
    parameterObj.pageSize = 5000;
    parameterObj.sortDirection = "desc",
      parameterObj.sortExpression = "datetime",
      parameterObj.responsiblePerson = responsiblePerson;
    if (this.activitySearchForm.value.isTestCustomer) {
      parameterObj.isTestCustomer = this.activitySearchForm.value.isTestCustomer;
    }
    if (!this.activitySearchForm.value.isTestCustomer) {
      parameterObj.isTestCustomer = false;
    }
    this.activitySearchService.generateExcelTicketByActivity(parameterObj).then((result: any) => {
      if (result && result.file) {
        var byteArray = new Uint8Array(result.file.data);
        var contentType = 'application/vnd.ms-excel';
        var blob = new Blob([byteArray], { type: contentType });
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "TicketReport_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
        // Append anchor to body.
        document.body.appendChild(a)
        a.click();
      } else {
        this.messageService.showMessage('No Record Found For the Given Filter', 'info');
      }
    }, (error) => {
      this.messageService.showMessage('Error occured while processing your request.', 'error');
      console.error(error);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 20-12-2019
   * @memberof ActivitySearchComponent
   */
  public changeEditMode(event) {
    this.rowData.forEach(t => t.isSelected = this.activitySearchForm.controls.isEditMode.value);
    this.gridApi.refreshCells({ force: true });
    this.gridApi.redrawRows();
    this.gridApi.gridCore.gridOptions.api.refreshHeader();
  }

  getselectedActivitiesId(data: any) {
    this.selectedActivities = data;
  }

  /**
   * @author Manali Joshi
   * @createdDate 20-12-2019
   * @memberof ActivitySearchComponent
   * call when user click on "change customer" button
   */
  openChangeCustomerDialog() {
    this.selectedActivities = this.gridApi.getSelectedRows();
    if (this.selectedActivities !== undefined && this.selectedActivities.length > 0) {
      const actIds = this.selectedActivities.map(a => a.id.toString());
      // Todo
      this.dialogService.custom(ChangeCustomerComponent, {}, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
        (response) => {
          if (response !== undefined && response !== '' && response !== false) {
            let jsonToPass = {
              'customerId': response[0].customerID ? response[0].customerID : '',
              'actIds': actIds,
              'isTest': response[0].IsTestCustomer ? response[0].IsTestCustomer : false,
              'updatedBy': this.userService.getUserDetail().id
            }
            this.activitySearchService.changeCustomer(jsonToPass).then(response => {
              if (response === true) {
                this.messageService.showMessage('Customer is successfully changed', 'success');
                this.selectedActivities = [];
                this.CDRService.callDetectChanges(this.cdr);
                this.search();
                // setTimeout(() => {
                //   this.search();
                // }, 1000);
              }

            });
          }
        }, (error) => {
          console.error(error);
        }
      );
    } else {
      this.messageService.showMessage('Please select at least one activity', 'error');
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 20-12-2019
   * @memberof ActivitySearchComponent
   * call when user click on "Change Activity" button
   */
  openChangeActivityStatusDialog() {
    this.selectedActivities = this.gridApi.getSelectedRows();
    if (this.selectedActivities !== undefined && this.selectedActivities.length > 0) {
      const lookup = {
        'activityStatusList': this.activitySearchLookup.activitystatuslist, 'responsiblePesronList': this.activitySearchLookup.responsiblePesronList,
        'activityDepartmentList': this.activitySearchLookup.departmentlistDetail, 'activityYear': this.activitySearchLookup.year,
        'ticketStatusList': this.activitySearchLookup.ticketStatusList
      };

      const actIds = this.selectedActivities.map(a => a.id.toString());
      // Todo
      this.dialogService.custom(ChangeActivityStatusComponent, { lookup: lookup, activityIds: actIds }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
        (response) => {
          if (response === true) {
            this.selectedActivities = [];
            let self = this;
            setTimeout(() => {
              self.search();
            }, 1000);
          }
        }, (error) => {
          console.error(error);
        }
      );
    } else {
      this.messageService.showMessage('Please select at least one activity', 'error');
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 03-01-2020
   * @memberof ActivitySearchComponent
   * this method will get customer infromation for activity popup header
   */
  getCustomerDetailsByCustomerId(selectedCustomerId: any, activityId: any): any {
    return new Promise((resolve, reject) => {
      this.activitySearchService.getCustomerDetails(selectedCustomerId).then(res => {
        if (res) {
          this.customerData = res;
          this.customerData.customerId = selectedCustomerId;
          this.customerData.activityId = activityId;
          this.customerData.activityCustomerFinalInformation = '';
          if (this.customerData !== undefined && this.customerData != null) {
            this.customerData.activityCustomerFinalInformation += this.customerData.customerName;
            if (this.customerData.address1 !== '' && this.customerData.address1 !== undefined && this.customerData.address1 !== null) {
              this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.address1;
            }
            if (this.customerData.zipCode !== '' && this.customerData.zipCode !== undefined && this.customerData.zipCode !== null) {
              this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.zipCode;
            }
            if (this.customerData.state !== '' && this.customerData.state !== undefined && this.customerData.state !== null) {
              this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.state;
            }
            if (this.customerData.city !== '' && this.customerData.city !== undefined && this.customerData.city !== null) {
              this.customerData.activityCustomerFinalInformation += ', ' + this.customerData.city;
            }
            if (this.customerData.customerNumber !== '' &&
              this.customerData.customerNumber !== undefined && this.customerData.customerNumber !== null) {
              this.customerData.activityCustomerFinalInformation += ' ( ' + this.customerData.customerNumber + ' )';
            }
          }
          if (this.customerData.salesProcessStatus !== undefined && this.customerData.salesProcessStatus === 'BlackListed') {
            this.customerData.showBlacklistIcon = true;
          } else {
            this.customerData.showBlacklistIcon = false;
          }
          if (this.customerData.doNotCall !== undefined && this.customerData.doNotCall === true &&
            (this.customerData.type === 'phonecall' && this.customerData.direction === 'out')) {
            this.customerData.isDoNotCall = true;
          } else {
            this.customerData.isDoNotCall = false;
          }
          resolve(this.customerData);
          this.CDRService.callDetectChanges(this.cdr);
        } else {
          reject(false);
        }
      },
        error => {
          reject(error);
        });
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 03-01-2020
   * @memberof ActivitySearchComponent
   * calls API that returns the filters of particular person
   */
  getFilterOfResponsiblePerson(event, userId: any, index: number) {
    event.stopPropagation();
    const self = this;
    let parameterObject = { type: 'activity', userId: userId };
    this.activitySearchService.getActivityFilter(parameterObject).then(response => {
      self.filterResponsiblePerson[index].filterList = response;
      this.CDRService.callDetectChanges(this.cdr);
    });
  }
  checkLocalStorage(): void {
    if (this.localStorageUtilityService.checkLocalStorageKey('ASearchCriteria')) {
      this.activitySearch = this.localStorageUtilityService.getFromLocalStorage('ASearchCriteria');
      this.activitySearchForm.patchValue(this.activitySearch);
      if (this.activitySearch && this.activitySearch.activitystatus[0] && this.activitySearch.activitystatus[0].id) {
        this.activitySearchForm.controls.activitystatus.patchValue([this.activitySearch.activitystatus[0].id])
      }
      this.search();
    } else {
      if (this.activitySearch.isTestCustomer === undefined) {
        this.activitySearch.isTestCustomer = false;
      }
      this.CDRService.callDetectChanges(this.cdr);
    }
  }
  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @memberof ActivitySearchComponent
   */
  ngOnInit(): void {
    this.userDetails = this.userService.getUserDetail();
    this.isDefaultReseller = this.userService.isDefaultReseller();
    this.showfeedback = this.userService.showFeedback();
    this.userResellerId = this.userService.getResellerId();
    this.initActivitySearchForm();
    this.getLookupForActivity();
    this.getAllActivitySearchCriteriaList();

    //if local storage already contains search value then assign it to search form and load data accordingly
    if (this.localStorageUtilityService.checkLocalStorageKey('activitySearchObject')) {
      this.preserveLocalStorageData = this.localStorageUtilityService.getFromLocalStorage('activitySearchObject');
      this.activitySearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('activitySearchObject'));
      this.search(true);
    }

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

    this.gridHighlightWatcher = this.ticketActivityOverlayService.gridHighlight.subscribe((result: any) => {
      if (result) {
        let index = this.opendedActivities.findIndex(openId => openId === result.prev);
        if (index > -1) {
          this.opendedActivities.splice(index, 1)
        }
        this.opendedActivities.push(result.current);
        this.lastOpenedActivity = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
        if(this.gridApi){
          this.gridApi.redrawRows();
        }
      }
    });

    /**
     * subscribe event to get minimized activity when activity close and
     * redraw grid to remove highlighted class
    */
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
      if(this.gridApi){
        this.gridApi.redrawRows();
      }
    });

    /**
    * subscribe event to get activityId when activity close and
    * call fun to remove id from clientIdsObject
    */
    this.closeActivityWatcher = this.ticketActivityOverlayService.closeActivityId.subscribe((closeActivityId: any) => {
      if (this.opendedActivities && this.opendedActivities.length > 0) {
        let i = this.opendedActivities.findIndex(openActivityId => openActivityId === closeActivityId);
        if (i > -1) {
          this.opendedActivities.splice(i, 1);
        }
      }
      if (!this.opendedActivities || this.opendedActivities.length == 0) {
        if (this.regexForGUID.test(closeActivityId)) {
          this.lastOpenedActivity = closeActivityId;
          this.localStorageUtilityService.addToLocalStorage('lastOpenedID', this.lastOpenedActivity);
        }

      } else {
        this.lastOpenedActivity = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
      }
      if(this.gridApi){
        this.gridApi.redrawRows();
      }
    });

    this.integrityServiceSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.channel === 'close_window') {
        setTimeout(() => {
          this.search(true);
        }, 500);
      }
    });

  }

  ngOnDestroy() {
    this.cdr.detach();
    if (this.gridHighlightWatcher) {
      this.gridHighlightWatcher.unsubscribe();
    }
    if (this.arrayListWatcher) {
      this.arrayListWatcher.unsubscribe();
    }
    if (this.closeActivityWatcher) {
      this.closeActivityWatcher.unsubscribe();
    }
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }
}
