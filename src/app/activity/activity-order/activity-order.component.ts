// External imports
import { Component, OnInit, ChangeDetectorRef, Pipe, PipeTransform, OnDestroy, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';

// Internal imports
import { ActivityOrderService } from '@app/activity/activity-order/activity-order.service';
import { ActivitySearchDetailsService } from '@app/activity/activity-search/activity-search-details.service';
import { LocalStorageUtilityService, UserService, CDRService, MessageService, CommonDataApiService, PostalChannelService, DialogService } from '@app/shared/services';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';

@Component({
  selector: 'app-activity-order',
  templateUrl: './activity-order.component.html',
  styleUrls: ['./activity-order.component.scss'],
  providers: [ActivityOrderService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityOrderComponent implements OnInit, OnDestroy {

  @ViewChildren('windowTitleBar') windowTitleBar: QueryList<any>;

  public userDetails: any; // Holds user Details
  public years = []; // Holds years
  public yy: any; // hold year
  public mm: any; // hold month
  public mainLookUpData: any = {}; // holds main lookup data
  public orderLookup: any = { 'responsiblePesronList': [], 'activityTagList': [], 'salesTypeList': [] }; // holds order lookup data
  public isManagement: any; // holds managment flag
  public orderGridState: any; // holds order grid state
  public orderDisplayData: any = {}; // display order Data
  public responsiblePesronList: any; // holds responsible person list
  public columnDefs: ColDef[]; // holds column defination data
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  public months = [
    { id: '01', name: 'Jan' },

    { id: '02', name: 'Feb' },
    { id: '03', name: 'Mar' },
    { id: '04', name: 'Apr' },
    { id: '05', name: 'May' },
    { id: '06', name: 'Jun' },
    { id: '07', name: 'Jul' },
    { id: '08', name: 'Aug' },
    { id: '09', name: 'Sep' },
    { id: '10', name: 'Oct' },
    { id: '11', name: 'Nov' },
    { id: '12', name: 'Dec' }
  ];
  public orderSearchForm: FormGroup; // holds order serach form
  public showfeedback: boolean; // hold feedback value
  private customerResellerId: string; //  holds customer reseller id
  public availableOrderDetails: any; // holds search api response
  public getRowStyle; // get row style
  public sideBar: any; // holds side bar data
  public defaultColDef: any; // holds default column data
  public gridApi: any; // holds grid Api data
  public gridColumnApi: any; // holds grid column  Api data
  public isSearchSuccess = false; // holds boolean value
  public domLayout;
  public getRowHeight;
  public userResellerId = '';
  public rowClassRules: any;
  // Title Header Data Relataed
  showBlacklistIcon: Boolean = false;
  isDoNotCall: boolean = false;
  public opendedActivities = [];
  public lastOpenedActivity = '';
  public isEmailIn: boolean = false;  // to set flag true when screen is email and direction is in
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  private arrayListWatcher: Subscription;
  private gridHighlightWatcher: Subscription;
  private closeActivityWatcher: Subscription;
  private integrityServiceSubscription: Subscription;

  constructor(private router: Router, private fb: FormBuilder, private messageService: MessageService,
    private cdr: ChangeDetectorRef, private cdrService: CDRService, private userService: UserService, private postalChannelService: PostalChannelService,
    private localStorageUtilityService: LocalStorageUtilityService, private activityOrderService: ActivityOrderService,
    private activitySearchDetailsService: ActivitySearchDetailsService, private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private ticketActivityOverlayService: TicketActivityOverlayService, private commonDataApiService: CommonDataApiService, private dialogService: DialogService) {

    this.columnDefs = [
      // {
      //   headerName: '', field: 'feedback', suppressMovable: true, suppressMenu: true, width: 30,
      //   cellRenderer: params => {
      //     if (this.showfeedback) {
      //       switch (params.value) {
      //         case 'Good':
      //           return `<i class="fa fa-star" color="red"  aria-hidden="true" title="Good" style="width: 16px; float: left;padding-top:8px;color:#00a65a"></i>`
      //         case 'Normal':
      //           return `<i class="fa fa-star" aria-hidden="true" title="Normal" style="width: 16px; float: left;padding-top:8px;color:#orange"></i>`
      //         case 'Poor':
      //           return `<i class="fa fa-star" aria-hidden="true" title="Poor" style="width: 16px; float: left;padding-top:8px;color:#ff0000"></i>`
      //         case 'NoFeedback':
      //           return `<i class="fa fa-star" aria-hidden="true" title="No Feedback" style="width: 16px; float: left;padding-top:8px;color:#333333" ></i>`
      //         default:
      //           break;
      //       }
      //     }
      //   }
      // },
      {
        headerName: "",
        field: "customerId",
        suppressMovable: true,
        cellClass: 'ag-icons-wrap',
        cellRenderer: params => {
          if (params.data && params.data.resellerId !== undefined && params.data.resellerId === '4dc601df-dc0e-4a7a-857d-9493ba33a223') {
            let element = ` <img class="cursor-pointer" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) " src="assets/images/Angebot.png">`
            return element;
          } else if (params.data && params.data.resellerId !== undefined && params.data.resellerId !== this.customerResellerId) {
            //let element = ` <img class="cursor-pointer" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) " src="assets/images/warning-original-16x16.png">`
            let element = `<i class="fas fa-exclamation-triangle text-danger" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) "></i>`
            return element;
          }
        },
        width: 30,
        sortable: false,
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: '', field: 'hasDocument', suppressMovable: true, suppressMenu: true, width: 30, cellClass: 'ag-icons-wrap',
        cellRenderer: params => {
          if (params.value === 'true') {
            return ` <img title="Attachment" class="font-15 cursor-pointer float-left" src="assets/images/attechment_icon.png">`
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Customer number',
        field: 'customerNumber',
        headerTooltip: 'Customer number',
        filter: 'agTextColumnFilter',
        width: 150,
      },
      {
        headerName: "Company Name",
        field: "customerName",
        headerTooltip: "Company Name",
        filter: "agTextColumnFilter",
        width: 200,
      },
      {
        headerName: "S",
        field: "state",
        tooltipField: "state",
        headerTooltip: "S",
        filter: "agTextColumnFilter",
        width: 50,
      },
      {
        headerName: "Sales Process Status",
        field: "salesProcessStatus",
        headerTooltip: "Sales Process Status",
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "Type",
        field: "type",
        headerTooltip: "Type",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 150,
        tooltipValueGetter: params => {
          if (params.data) {
            return params.data.type + '-' + params.data.direction
          }
        },
        cellRenderer: params => {
          if (params.data) {
            return params.data.type + '-' + params.data.direction
          }
        }
      },
      {
        headerName: "Subject",
        field: "subject",
        headerTooltip: "Subject",
        tooltipField: "subject",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Month",
        field: "commissionMonth",
        headerTooltip: "Month",
        tooltipField: "Month",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 80,
      },
      {
        headerName: "Package",
        field: "package",
        headerTooltip: "Package",
        tooltipField: "Package",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 120,
      },
      {
        headerName: "SaleType",
        field: "saleType",
        headerTooltip: "SaleType",
        tooltipField: "SaleType",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 110,
      },
      {
        headerName: "Receiver",
        field: "commissionReceiverName",
        headerTooltip: "Receiver",
        tooltipField: "Receiver",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 150,
      },
      {
        headerName: "OrderPrice",
        field: "orderPrice",
        headerTooltip: "OrderPrice",
        tooltipField: "OrderPrice",
        cellStyle: { cursor: "pointer", textAlign: "right" },
        filter: "agTextColumnFilter",
        width: 100,
        valueFormatter: this.currencyFormatter,
      },
      {
        headerName: "Comment",
        field: "comment",
        headerTooltip: "Comment",
        tooltipField: "comment",
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        width: 120,
      },
      {
        headerName: "Actual",
        field: "datetime",
        headerTooltip: "Actual Datetime",
        tooltipField: 'datetimeTimeTitle',
        filter: "agTextColumnFilter",
        width: 150,
        cellRenderer: params => {
          if (params.value) {
            return moment(params.value).format('MM/DD/YY hh:mm A')
          }
        }
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
      suppressColumnVirtualisation: true
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
    this.getRowStyle = (params) => {
      if (params.data && params.data.priority === 'Immediate') {
        return { 'background-color': '#fcafaf' };
      } else if (params.data && params.data.priority === 'High') {
        return { 'background-color': '#fbfcaf' };
      } else if (params.data && params.data.isCurrentRefundRequest === true) {
        return { 'background-color': '#ADD8E6' };
      } else if (params.data && params.data.isRefundRequestDenied === true) {
        return { 'background-color': '#6ba8bc' };
      }
      return null;
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

  onDateChange() {
    setTimeout(() => {
      this.callDetectionChanges();
    }, 100);
  }


  /**
 * @author Manali Joshi
 * @createdDate 10/1/2020
 * @param {*}  inputvalue
 * @memberof ActivitySearchComponent
 */
  filterData(eventTarget) {
    this.orderLookup.responsiblePesronList = this.rpLookupDataForFilter;
    this.orderLookup.responsiblePesronList = this.orderLookup.responsiblePesronList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.callDetectionChanges();
  }


  /**
   * @author om kanada
   * @param {*} params
   *          holds parameter of grid
   * @description
   *         function used to ready grid
   * @memberof ActivityOrderComponent
   */
  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    } else {
      params.api.sizeColumnsToFit();
    }
  }

  public currencyFormatter(params) {
    if (params.value) {
      return params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  /**
   * @author om kanada
   * @param {*} params
   *         holds parameter of particular row
   * @description
   *         this function is perform when ag-grid row clicked.
   * @memberof ActivityOrderComponent
   */
  public onRowClicked(params): void {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute("data-action-type");
      if (actionType == "goToCustomerCart") {
        this.goToCustomerCart(params.data.customerId);
      } else {
        this.checkActivityAlreadyOpenOrNot(params); // display toster if activity is alrday open and show in maximized window
      }
    }
  }

  /**
  * @author Manali Joshi
  * @createdDate 17-01-2019
  * @description this function is used to check activity is open already in current tab
  * @param {*} id
  * @memberof ActivityOrderComponent
  */
  checkActivityAlreadyOpenOrNot(e) {
    const isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'activity')
    if (!isOpen) {
      this.opendedActivities.push(e.data.id);
      this.lastOpenedActivity = undefined;
      this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
    }
    this.gridApi.redrawRows();
  }

  /**
   * @author Manali Joshi
   * @createdDate 17-01-2019
   * @description this function is used to check activity is open already in current tab
   * @param {*} id
   * @memberof ActivityOrderComponent
   */
  openWindow(e, id, customerData): any {
    return new Promise((resolve, reject) => {
      this.opendedActivities.push(id);
      // this.opendedActivitiesCustomerData.push(customerData);
      this.callDetectionChanges();
      // let titleRef;
      // this.windowTitleBar.forEach((titlebar) => {
      //   if (titlebar.elementRef.nativeElement.parentElement.id.indexOf(id) > -1) {
      //     titleRef = titlebar;
      //   }
      // });
      // this.selectedActId = id;
      this.gridApi.redrawRows();
      if (e.data.screen === 'email' && e.data.direction === "in") {
        this.isEmailIn = true;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-detail', topic: 'isEmailIn', data: this.isEmailIn });
      }
      let dialogData = { id: id, screen: 'activity', data: { 'isEmailIn': this.isEmailIn } };
      this.ticketActivityOverlayService.openWindow(dialogData, undefined);
      resolve(true);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 17-01-2019
   * @description this function is used to load next activity information
   * @param {*} id
   * @memberof ActivityOrderComponent
   */
  // next(windowTitleBar, id) {
  //   this.isNextBtnClicked = true;
  //   const refrenceId = windowTitleBar.elementRef.nativeElement.parentElement.id.replace('titlebar_', '');
  //   let nextActivity: any = this.activitySearchDetailsService.nextAndPrevId(refrenceId, 'next', this.opendedActivities);
  //   if (!nextActivity.isAlreadyOpen) {
  //     const couter = document.getElementById('counter_' + refrenceId).innerHTML;
  //     if (couter) {
  //       let couters = couter.split('/');
  //       const index = parseInt(couters[0]) + 1;
  //       if (index <= parseInt(couters[1])) {
  //         document.getElementById('counter_' + refrenceId).innerHTML = index + '/' + couters[1];
  //       }
  //     }
  //     // this.selectedActId = nextActivity.id;
  //     // this.gridApi.redrawRows();
  //     let i = this.opendedActivities.findIndex(openActivityId => openActivityId === id);
  //     if (i > -1) {
  //       this.opendedActivities.splice(i, 1);
  //       this.opendedActivities.push(nextActivity.id);
  //       this.gridApi.redrawRows();
  //     }
  //     this.activitySearchDetailsService.divideInToChunk(nextActivity.id);
  //     this.ticketActivityOverlayService.reloadActivityWindow(refrenceId, nextActivity.id);
  //     /* we should implement this by promise: this code is use to releace the title on next and previous */
  //     setTimeout(() => {
  //       let a = Array.from(document.getElementsByClassName('k-window-title'));
  //       a.forEach(el => {
  //         if (el.nextElementSibling.id.indexOf(refrenceId) !== -1) {
  //           el.innerHTML = document.getElementById('customTemp').innerHTML;
  //         }
  //       });
  //     }, 5000);
  //   } else if (nextActivity === 0) {

  //   } else {
  //     this.ticketActivityOverlayService.maximizeWindow(nextActivity.id, 'activity');
  //     this.messageService.showMessage('Activity Already Open', 'error');
  //   }
  // }

  /**
   * @author Manali Joshi
   * @createdDate 17-01-2019
   * @description this function is used to load previous activity information
   * @param {*} id
   * @memberof ActivityOrderComponent
   */
  // previous(windowTitleBar, id) {
  //   this.isPreviousBtnClicked = true;
  //   const refrenceId = windowTitleBar.elementRef.nativeElement.parentElement.id.replace('titlebar_', '');
  //   const previousActivity: any = this.activitySearchDetailsService.nextAndPrevId(refrenceId, 'prev',this.opendedActivities);
  //   if (!previousActivity.isAlreadyOpen) {
  //     const couter = document.getElementById('counter_' + refrenceId).innerHTML;
  //     if (couter) {
  //       let couters = couter.split('/');
  //       const index = parseInt(couters[0]) - 1;
  //       if (index > 0) {
  //         document.getElementById('counter_' + refrenceId).innerHTML = index + '/' + couters[1];
  //       }
  //     }
  //     // this.selectedActId = previousActivity.id;
  //     // this.gridApi.redrawRows();
  //     let i = this.opendedActivities.findIndex(openActivityId => openActivityId === id);
  //     if (i > -1) {
  //       this.opendedActivities.splice(i, 1);
  //       this.opendedActivities.push(previousActivity.id);
  //       this.gridApi.redrawRows();
  //     }

  //     this.ticketActivityOverlayService.reloadActivityWindow(refrenceId, previousActivity.id);
  //     /* we should implement this by promise: this code is use to releace the title on next and previous */
  //     setTimeout(() => {
  //       let a = Array.from(document.getElementsByClassName('k-window-title'));
  //       a.forEach(el => {
  //         if (el.nextElementSibling.id.indexOf(refrenceId) !== -1) {
  //           el.innerHTML = document.getElementById('customTemp').innerHTML;
  //         }
  //       });
  //     }, 5000);
  //   } else if (previousActivity === 0) {

  //   } else {
  //     this.ticketActivityOverlayService.maximizeWindow(previousActivity.id, 'activity');
  //     this.messageService.showMessage('Activity Already Open', 'error');
  //   }
  // }


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

  /**
   * @author om kanada
   * @description
   *        This function is used to check localstorage For paging.
   */
  // private checkLocalStorageForPaging(): void {
  //   if (this.localStorageUtilityService.checkLocalStorageKey('settings') && this.localStorageUtilityService.getFromLocalStorage('settings')['orderSearch'] !== undefined) {
  //     const pageSize = this.localStorageUtilityService.getFromLocalStorage('settings')['orderSearch']['pageSize'];
  //     // this.orderGridState.take = pageSize; ???
  //   } else {
  //     // const pageSize = this.userService.getpageSize('orderSearch'); ????
  //     // this.orderGridState.take = pageSize;
  //     // this._userService.setPageSettingInLocal('orderSearch', pageSize);
  //   }
  // }

  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }
  /**
   * @author om kanada
   * @param {*} event
   *         holds event send from html
   * @param {*} action
   *          holds type of action perform
   * @description
   *           this function is used to change month and year on buttton click
   * @memberof ActivityOrderComponent
   */

  changeMonth(event: any, action?: any): void {
    if (action === undefined || action === '' || action === null) {

    } else if (action === 'Previous') {

      const isExists = this.months.findIndex(t => t.id === this.orderSearchForm.controls.commissionMonthFrom.value);
      if (isExists !== -1) {
        this.orderSearchForm.controls.commissionMonthTo.setValue(this.orderSearchForm.controls.commissionMonthFrom.value);
        this.orderSearchForm.controls.commissionYearTo.setValue(this.orderSearchForm.controls.commissionYearFrom.value);
        if (isExists !== 0) {
          this.orderSearchForm.controls.commissionMonthFrom.setValue(this.months[isExists - 1].id);
        } else {
          this.orderSearchForm.controls.commissionMonthFrom.setValue(this.months[11].id);
          const index = this.years.findIndex(t => t.id === this.orderSearchForm.controls.commissionYearFrom.value);
          if (index !== -1) {
            if (index !== 0) {
              this.orderSearchForm.controls.commissionYearFrom.setValue(this.years[index - 1].id);
            } else {
              this.orderSearchForm.controls.commissionYearFrom.setValue(this.years[index].id);
            }
          }

        }
      }
    } else if (action === 'Next') {
      const isExists = this.months.findIndex(t => t.id === this.orderSearchForm.controls.commissionMonthTo.value);
      if (isExists !== -1) {
        this.orderSearchForm.controls.commissionMonthFrom.setValue(this.orderSearchForm.controls.commissionMonthTo.value);
        this.orderSearchForm.controls.commissionYearFrom.setValue(this.orderSearchForm.controls.commissionYearTo.value);
        if (isExists !== 11) {
          this.orderSearchForm.controls.commissionMonthTo.setValue(this.months[isExists + 1].id);
        } else {
          this.orderSearchForm.controls.commissionMonthTo.setValue(this.months[0].id);
          const index = this.years.findIndex(t => t.id === this.orderSearchForm.controls.commissionYearFrom.value);
          if (index !== -1) {
            if (index !== 5) {
              this.orderSearchForm.controls.commissionYearTo.setValue(this.years[index + 1].id);
            } else {
              this.orderSearchForm.controls.commissionYearTo.setValue(this.years[index].id);
            }
          }

        }
      }

    }
    this.search();
  }

  /**
   * @author om kanada
   * @description
   *        function export ag grid detail as excel
   * @memberof ActivityOrderComponent
   */
  public onBtExport(): void {
    const params = {
      fileName: 'Commission',
      columnKeys: ["customerNumber", "customerName", "state", 'salesProcessStatus', 'type', 'subject', 'commissionMonth', 'package', 'saleType', 'commissionReceiverName', 'orderPrice', 'comment', 'datetime']
    };
    this.gridApi.exportDataAsExcel(params);
  }

  /**
   * @author om kanada
   * @description
   *        function filter out input data and call search Api.
   * @memberof ActivityOrderComponent
   */
  public initAvailableOrders(): void {
    if (this.isManagement === false) {
      this.orderSearchForm.get('responsiblePersonResult').setValue([this.userDetails.id]);
    }
    const orderTempSearch = JSON.parse(JSON.stringify(this.orderSearchForm.value));
    this.localStorageUtilityService.addToLocalStorage('OSearchCriteria', this.orderSearchForm.value);


    // set data for searching for multiselect dropdown
    // intial taglist,salestype,responsible inital
    orderTempSearch.tagList = [];
    orderTempSearch.saleType = [];
    orderTempSearch.responsiblePerson = [];
    orderTempSearch.pageNo = '1';
    orderTempSearch.pageSize = '1000';
    orderTempSearch.sortDirection = "desc";
    orderTempSearch.sortExpression = "datetime";
    // tag
    for (let i = 0; i < (this.orderSearchForm.get('tagListResult').value !== undefined && this.orderSearchForm.get('tagListResult').value !== null ? this.orderSearchForm.get('tagListResult').value.length : 0); i++) {
      if (this.orderSearchForm.get('tagListResult').value[i] !== undefined) {
        orderTempSearch['tagList'].push({ id: this.orderSearchForm.get('tagListResult').value[i] });

      }
    }

    // saleType
    for (let i = 0; i < (this.orderSearchForm.get('saleTypeResult').value !== undefined && this.orderSearchForm.get('saleTypeResult').value !== null ? this.orderSearchForm.get('saleTypeResult').value.length : 0); i++) {
      if (this.orderSearchForm.get('saleTypeResult').value[i] !== undefined) {
        orderTempSearch['saleType'].push({ id: this.orderSearchForm.get('saleTypeResult').value[i] });
      }
    }
    // responsiblePerson
    for (let i = 0; i < (this.orderSearchForm.get('responsiblePersonResult').value !== undefined && this.orderSearchForm.get('responsiblePersonResult').value !== null ? this.orderSearchForm.get('responsiblePersonResult').value.length : 0); i++) {
      if (this.orderSearchForm.get('responsiblePersonResult').value[i] !== undefined) {
        orderTempSearch['responsiblePerson'].push({ id: this.orderSearchForm.get('responsiblePersonResult').value[i] });
      }
    }

    for (const key in orderTempSearch) {
      if (orderTempSearch[key]) {
        if (typeof orderTempSearch[key] !== 'boolean') {
          if (key !== 'tagList' && key !== 'saleType' && key !== 'responsiblePerson') {
            orderTempSearch[key] = orderTempSearch[key].toString().trim();
            if (key === 'dateFrom') {
              const tmpDate = new Date(orderTempSearch[key]);
              orderTempSearch[key] = moment(tmpDate).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            } else if (key === 'dateTo') {
              const tmpDate = new Date(orderTempSearch[key]);
              orderTempSearch[key] = moment(orderTempSearch[key]).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(tmpDate) ? '-04:00' : '-05:00');
            }
          }
        }
      }
    }

    if (orderTempSearch.dateTo !== undefined && orderTempSearch.dateTo === null) {
      orderTempSearch.dateTo = undefined;
    }
    if (orderTempSearch.dateFrom !== undefined && orderTempSearch.dateFrom === null) {
      orderTempSearch.dateFrom = undefined;
    }

    delete orderTempSearch.saleTypeResult;
    delete orderTempSearch.tagListResult;
    delete orderTempSearch.responsiblePersonResult;

    this.activityOrderService.orderSearch(orderTempSearch).then(response => {
      //this.availableOrderDetails = response;
      if (response && response.counter) {
        this.dialogService.custom(ConfirmLargedataDialogComponent, { searchdata: orderTempSearch, counter: response.counter, resultLength: response.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
          (response) => {

            if (response) {
              this.activityOrderService.orderSearch(response).then((result: any) => {
                this.availableOrderDetails = result;
                this.availableOrderDetails.forEach(element => {
                  if (element.datetime) {
                    element.datetime = moment(element.datetime, 'MM/DD/YY hh:mm A').utc().format();
                    element.datetimeTimeTitle = moment(element.datetime).format('MM/DD/YY hh:mm A')
                  }
                });
                if (this.opendedActivities && this.opendedActivities.length > 0) {
                  for (const actId of this.opendedActivities) {
                    this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, this.availableOrderDetails);
                  }
                } else {
                  this.ticketActivityOverlayService.preserveGridData(this.availableOrderDetails);
                }
                result.orderPrice = this.getHighLightActivityIdForList();
                if (result && result.length > 0) {
                  this.orderDisplayData.orderQuantity = result[0].orderQuantity;
                  this.orderDisplayData.orderAmount = result[0].orderAmount;
                  this.orderDisplayData.orderAverageAmount = result[0].orderAverageAmount;
                  this.orderDisplayData.refundQuantity = result[0].refundQuantity;
                  this.orderDisplayData.refundAmount = result[0].refundAmount;
                  if (this.orderDisplayData.refundAmount) {
                    this.orderDisplayData.refundAmountPercentage = Math.abs((this.orderDisplayData.refundAmount * 100) / (this.orderDisplayData.orderAmount + Math.abs(this.orderDisplayData.refundAmount))).toFixed(2) + '%';
                  } else {
                    this.orderDisplayData.refundAmountPercentage = undefined;
                  }
                  this.orderDisplayData.refundAverageAmount = result[0].refundAverageAmount;
                  this.orderDisplayData.totalQuantity = result[0].totalQuantity;
                  this.orderDisplayData.totalCustomer = result[0].totalCustomer;
                  this.orderDisplayData.totalAmount = result[0].totalAmount;
                  this.orderDisplayData.totalAverageAmount = result[0].totalAverageAmount;
                }
                this.callDetectionChanges();
              });
            }
          }, (error) => {
            console.error(error);
          }
        );
      } else {
        if (response) {
          this.availableOrderDetails = response;
          this.availableOrderDetails.forEach(element => {
            if (element.datetime) {
              element.datetime = moment(element.datetime, 'MM/DD/YY hh:mm A').utc().format();
              element.datetimeTimeTitle = moment(element.datetime).format('MM/DD/YY hh:mm A')
            }
          });
          // this.activitySearchDetailsService.preserveGridData(this.availableOrderDetails);
          // this.ticketActivityOverlayService.preserveGridData(this.availableOrderDetails);
          if (this.opendedActivities && this.opendedActivities.length > 0) {
            for (const actId of this.opendedActivities) {
              this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, this.availableOrderDetails);
            }
          } else {
            this.ticketActivityOverlayService.preserveGridData(this.availableOrderDetails);
          }
          response.orderPrice = this.getHighLightActivityIdForList();
          if (response && response.length > 0) {
            this.orderDisplayData.orderQuantity = response[0].orderQuantity;
            this.orderDisplayData.orderAmount = response[0].orderAmount;
            this.orderDisplayData.orderAverageAmount = response[0].orderAverageAmount;
            this.orderDisplayData.refundQuantity = response[0].refundQuantity;
            this.orderDisplayData.refundAmount = response[0].refundAmount;
            if (this.orderDisplayData.refundAmount) {
              this.orderDisplayData.refundAmountPercentage = Math.abs((this.orderDisplayData.refundAmount * 100) / (this.orderDisplayData.orderAmount + Math.abs(this.orderDisplayData.refundAmount))).toFixed(2) + '%';
            } else {
              this.orderDisplayData.refundAmountPercentage = undefined;
            }
            this.orderDisplayData.refundAverageAmount = response[0].refundAverageAmount;
            this.orderDisplayData.totalQuantity = response[0].totalQuantity;
            this.orderDisplayData.totalCustomer = response[0].totalCustomer;
            this.orderDisplayData.totalAmount = response[0].totalAmount;
            this.orderDisplayData.totalAverageAmount = response[0].totalAverageAmount;
          }
          this.callDetectionChanges();
        }
      }

      this.localStorageUtilityService.addToLocalStorage('searchActivityData', JSON.stringify(this.availableOrderDetails));
      this.callDetectionChanges();
    });
  }

  /**
   * @author om kanada
   * @description
   *        function  get HighLightActivity Id For List.
   * @memberof ActivityOrderComponent
   */
  public getHighLightActivityIdForList(): void {
    if (this.localStorageUtilityService.checkLocalStorageKey("OSearchCriteria") && this.localStorageUtilityService.checkLocalStorageKey("orderListForhighLight")) {
      const orderListForhighLight = this.localStorageUtilityService.getFromLocalStorage("orderListForhighLight");
      // this.activityHighlightService.getHighLightActivityIdForList(orderListForhighLight, this.availableOrderDetails); ?????
    }
  }
  /**
   * @author om kanada
   * @description
   *        reset all input type and form data on reset button click.
   * @memberof ActivityOrderComponent
   */
  resetFilter(event: any): void {
    this.localStorageUtilityService.removeFromLocalStorage('OSearchCriteria');
    this.localStorageUtilityService.removeFromLocalStorage('searchActivityData');
    this.localStorageUtilityService.removeFromLocalStorage('orderListForhighLight');
    this.orderSearchForm.reset();
    this.getYear();
    this.availableOrderDetails = [];
    this.responsiblePesronList = JSON.parse(JSON.stringify(this.orderLookup.responsiblePesronList));
    // this.isSearchSuccess = false;
    if (this.isManagement) {
      this._setLoginUserAsResponsible();
    }
    this.callDetectionChanges();
  }

  // resetAllMultiDropDownList(isSetLoginUserAsResponsible: any): void {
  //   this.salesTypeList = JSON.parse(JSON.stringify(this.orderLookup.salesTypeList));
  //   this.activityTagList = JSON.parse(JSON.stringify(this.orderLookup.activityTagList));
  //   this.responsiblePesronList = JSON.parse(JSON.stringify(this.orderLookup.responsiblePesronList));

  //   // after reset set login user as responsible
  //   if (isSetLoginUserAsResponsible !== undefined && isSetLoginUserAsResponsible !== true && isSetLoginUserAsResponsible !== '') {
  //     this._setLoginUserAsResponsible();
  //   }
  //   const self = this;
  //   setTimeout(() => {
  //     self.cdrService.callDetectChanges(self.cdr);
  //   }, 100);
  // }

  /**
   * @author om kanada
   * @description
   *        set Login user as responsible person.
   * @memberof ActivityOrderComponent
   */
  _setLoginUserAsResponsible(): void {
    if (this.userDetails.id) {
      this.orderSearchForm.get('responsiblePersonResult').setValue([this.userDetails.id]);
      this.responsiblePesronList.forEach((value: any, name: any): void => {
        this.orderSearchForm.get('responsiblePersonResult').value.forEach((match: any): void => {
          if (value.id === match.id) {
            value.selected = true;
            value.ticked = true;
          }
        });
      });
    }
  }

  /**
   * @author om kanada
   * @description
   *        check the givent date is in day light saving on EST zone  or not.
   * @memberof ActivityOrderComponent
   */
  private isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  /**
   * @author om kanada
   * @description
   *        check validation of date and if all condition is satisfied then call initAvailable function.
   * @memberof ActivityOrderComponent
   */
  public search(): void {
    if (this.orderSearchForm.controls.dateFrom.value && this.orderSearchForm.controls.dateTo.value && (moment(this.orderSearchForm.controls.dateFrom.value).format('YYYY-MM-DD') > moment(this.orderSearchForm.controls.dateTo.value).format('YYYY-MM-DD'))) {
      this.messageService.showMessage('\'Actual Date To\' should be greater than \'Actual Date From\'', 'error');
    } else if (this.orderSearchForm.controls.commissionYearFrom.value > this.orderSearchForm.controls.commissionYearTo.value) {
      this.messageService.showMessage('\'Commission Year To\' should be greater than \'Commission Year From\'', 'error');
    } else {
      if (this.orderSearchForm.controls.commissionYearFrom.value === this.orderSearchForm.controls.commissionYearTo.value && this.orderSearchForm.controls.commissionMonthFrom.value > this.orderSearchForm.controls.commissionMonthTo.value) {
        this.messageService.showMessage('\'Commission Month To\' should be greater than \'Commission Month From\'', 'error');
      } else {
        // this.orderGridState.skip = 0;
        this.initAvailableOrders();
      }

    }
  }

  /**
   * @author om kanada
   * @description
   *        This function is used to check localstorage .
   * @memberof ActivityOrderComponent
   */
  private checkLocalStorage(): void {
    if (this.localStorageUtilityService.checkLocalStorageKey('OSearchCriteria')) {
      this.orderSearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('OSearchCriteria'));
      this.callDetectionChanges();
      this.search();
    } else {
      if (this.orderSearchForm.get('isTestCustomer').value === undefined) {
        this.orderSearchForm.get('isTestCustomer').setValue(false);
      }
      this.callDetectionChanges();
    }

  }

  /**
   * @author om kanada
   * @description
   *        This function is used to get  month and year.
   * @memberof ActivityOrderComponent
   */
  private getYear(): void {
    const today = new Date();
    this.years = [];
    this.yy = today.getFullYear();
    this.mm = today.getMonth() + 1;
    for (let i = 2014; i <= (this.yy + 1); i++) {
      this.years.push({ id: i.toString(), name: i.toString() });
    }
    this.mm = (this.mm < 10) ? '0' + this.mm.toString() : this.mm.toString();
    this.orderSearchForm.get('commissionMonthFrom').setValue(this.mm);
    this.orderSearchForm.get('commissionMonthTo').setValue(this.mm);
    this.orderSearchForm.get('commissionYearFrom').setValue(this.yy.toString());
    this.orderSearchForm.get('commissionYearTo').setValue(this.yy.toString());
    this.callDetectionChanges();
  }

  /**
   * @author om kanada
   * @description function call to call detection changes method
   * @memberof ActivitySearchComponent
   */
  callDetectionChanges(): void {
    this.cdrService.callDetectChanges(this.cdr);
  }

  /**
   * @author om kanada
   * @description function call to select all val from lookup
   * @param {string} multipleSelectfor
   *               holds value  holds lookup selected name
   * @memberof ActivitySearchComponent
   */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'tagList':
        selected = [];
        selected = this.orderLookup.activityTagList.map(
          item => item.id
        );
        this.orderSearchForm.get('tagListResult').patchValue(selected);
        break;

      case 'responsiblePesron':
        selected = [];
        selected = this.orderLookup.responsiblePesronList.map(
          item => item.id
        );
        this.orderSearchForm.get('responsiblePersonResult').patchValue(selected);
        break;

      case 'SalesType':
        selected = [];
        selected = this.orderLookup.salesTypeList.map(
          item => item.id
        );
        this.orderSearchForm.get('saleTypeResult').patchValue(selected);
        break;
    }
  }

  /**
   * @author om kanada
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof ActivitySearchComponent
   */
  public onClearAll(clearSelectfor?: string): void {
    this.orderLookup.responsiblePesronList = this.rpLookupDataForFilter;
    if (this.orderSearchForm && clearSelectfor) {
      this.orderSearchForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author om kanada
   * @description close drop-down
   * @param {NgSelectComponent} select
   * @memberof CustomerSearchComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  /**
   * @author om kanada
   * @description
   *        This function is used to get order serach lookup data from Api.
   * @memberof ActivityOrderComponent
   */
  private getLookupForOrderSearch(): void {
    const self = this;
    self.activityOrderService.getLookupForOrderSearch().then((response: any) => {
      if (response) {
        self.mainLookUpData = JSON.parse(JSON.stringify(response));
        self.orderLookup.activityTagList = response.activityTagList;
        self.orderLookup.salesTypeList = response.salesTypeList;
        self.orderLookup.responsiblePesronList = response.responsiblePesronList;
        self.rpLookupDataForFilter = response.responsiblePesronList;
        if (this.isManagement === false) {
          if (self.userDetails.id) {
            self.orderSearchForm.get('responsiblePersonResult').setValue(self.userDetails.id);
          }
        }
        this.callDetectionChanges();
        this.checkLocalStorage();
      }
    });
  }

  /**
   * @author om kanada
   * @description
   *        This function is call functions on page load based on conditions.
   * @memberof ActivityOrderComponent
   */

  private init(): void {
    this.getYear(); // To get Year
    this.getLookupForOrderSearch(); // get order search lookupdata

    if (this.localStorageUtilityService.checkLocalStorageKey('reBindGrid')) {
      this.localStorageUtilityService.removeFromLocalStorage('reBindGrid');
      this.search();
    }

  }


  // setSelectedActivityId(activityIdData) {
  //   const self = this;
  //   self.selectedActivityID = this.activityHighlightService.setSelectedActivityId(activityIdData);
  //   this.cdr.detectChanges();
  // }

  //   public storeActivityIDforHighLight(activityid) {
  //     if (activityid !== undefined && activityid.activityId !== undefined) {
  //         var orderListForhighLight = this.activityHighlightService.storeActivityIDforHighLight(activityid, this.availableOrderDetails);
  //         this.localStorageUtilityService.addToLocalStorage("orderListForhighLight", orderListForhighLight);
  //     }
  //     // this.cdr.detectChanges();
  //     this.CDRService.callDetectChanges(this.cdr);
  // }


  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.initialLoadOrderSearchForm();
    // this.isManagement = this.userService.getProperty('isManagementUser'); ???
    // this.checkLocalStorageForPaging();
    //   this.subscription = this.activityService.getHighlightChangeEmitter().subscribe((activityData) => {
    //     this.setSelectedActivityId(activityData);
    //     this.storeActivityIDforHighLight(activityData.currentActivityId);
    // });
    this.init();
    this.showfeedback = this.userService.showFeedback();
    this.customerResellerId = this.userService.getResellerId();


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
        this.gridApi.redrawRows();
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
      this.gridApi.redrawRows();
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
        this.gridApi.redrawRows();
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

  ngOnDestroy() {
    if (this.cdr) {
      this.cdr.detach();
    }
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

  /**
   * @author om kanada
   * @description
   *        to intailiaze ordersearchform on page load.
   * @memberof ActivityOrderComponent
   */
  initialLoadOrderSearchForm(): void {
    this.orderSearchForm = this.fb.group({
      tagListResult: [null],
      isTestCustomer: [false],
      isCrystaCustomer: [false],
      commissionMonthTo: '',
      commissionYearTo: '',
      commissionMonthFrom: '',
      commissionYearFrom: '',
      saleTypeResult: [null],
      isCurrentRefundRequest: [false],
      responsiblePersonResult: [null],
      dateFrom: [null],
      dateTo: [null]
    });
  }
}


/**
 * @author om kanada
 * @description
 *        to seperate comma from given input.
 * @memberof ActivityOrderComponent
 */
@Pipe({ name: 'commaSeparatedNumber' })
export class CommaSeparatedNumber implements PipeTransform {
  transform(value: number): any {
    if (value !== undefined) {
      return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }
}
