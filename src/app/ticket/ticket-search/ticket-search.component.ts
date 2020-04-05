// External Imports
import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { ColDef } from "ag-grid-community";
import { NgSelectComponent } from "@ng-select/ng-select";

// Internal Imports
import { UserService, CDRService, LocalStorageUtilityService, DialogService } from '@app/shared/services';
import { TicketSearchService } from '@app/ticket/ticket-search/ticket-search.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { MessageService } from '@app/shared/services/message.service';
import { SaveNewFilterDialogComponent } from '@app/shared/dialogue/save-new-filter-dialog/save-new-filter-dialog.component';
import { LoaderService } from '@app/shared/loader/loader.service';
import { Subscription } from 'rxjs';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';

@Component({
  styleUrls: ['./ticket-search.component.scss'],
  templateUrl: './ticket-search.component.html',
  providers: [TicketSearchService],
  // changeDetection: ChangeDetectionStrategy.OnPush  // date don't refelect less filter more filter so i comment
})


export class TicketSearchComponent implements OnInit, OnDestroy {

  public isSearchDisable: boolean = true;
  public ticketSearchLookup: any = {};
  public updateCreateDate: boolean = false;
  public userDetails: any = {};
  public showfeedback: boolean;
  public ticketSearchForm: FormGroup;
  public rowData: any = [];
  public defaultColDef: any;
  public sideBar: any;
  public gridApi;
  public rowClassRules: any;
  public getRowStyle: any;
  public gridColumnApi;
  public columnDefs: ColDef[];
  public detailCellRendererParams;
  public getRowHeight;
  public availableTicket: { data: any; total: any };
  public SearchCriteriaList: any;
  public showLoading: boolean = false;
  public res = [];
  public detailRowHeight;
  public opendedTickets = [];
  public lastOpenedTicket = '';
  public opendedDetailActivity: any = [];
  public gridHighlightWatcher: Subscription;
  public arrayListWatcher: Subscription;
  public closeActivityWatcher: Subscription;
  public detailActivityData: any = {};
  public masterGridClicked: boolean;
  public detailActivityDetailsArr: any = [];
  public preserveLocalStorageData: any = {};
  public integrityServiceSubscription: Subscription;
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private ticketSearchService: TicketSearchService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private loaderService: LoaderService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) {
    {
      this.columnDefs = [
        {
          headerName: "",
          field: "customerId",
          headerTooltip: "Go to customer",
          cellRenderer: params => {
            let element = `
                          <img style="cursor: pointer;" data-action-type="goToCustomerCart" height="20px" width="20px" alt="Go to customer" title="Go to customer" src="assets/images/Angebot.png">
                          `;
            return element;
          },
          width: 50,
          sortable: false,
          tooltip: () => {
            return '';
          }
        },
        {
          headerName: "Customer Number",
          field: "customerNumber",
          headerTooltip: "Customer Number",
          filter: "agTextColumnFilter",
          width: 200,
          cellRenderer: 'agGroupCellRenderer'
        },
        {
          headerName: "Customer Name",
          field: "customerName",
          tooltipField: "customerName",
          headerTooltip: "Customer Name",
          cellStyle: { cursor: "pointer" },
          filter: "agTextColumnFilter",
        },
        {
          headerName: "Sales Process Status",
          field: "sps",
          tooltipField: "sps",
          headerTooltip: "Sales Process Status",
          cellStyle: { cursor: "pointer" },
          filter: "agTextColumnFilter",
          width: 200,
        },
        {
          headerName: "Year",
          field: "year",
          headerTooltip: "Year",
          filter: "agTextColumnFilter",
          width: 100,
        },
        {
          headerName: "Department",
          field: "department",
          headerTooltip: "Department",
          filter: "agTextColumnFilter",
          width: 150,
        },
        {
          headerName: "Status",
          field: "ticketStatusText",
          headerTooltip: "Ticket Status",
          tooltipField: "ticketStatusText",
          filter: "agTextColumnFilter",
          width: 130
        },
        {
          headerName: "Ticket Type",
          field: "typeText",
          headerTooltip: "Ticket Type",
          tooltipField: "typeText",
          filter: "agTextColumnFilter",
          width: 200,
        },
        {
          headerName: "Sub-Type",
          field: "errorTypeText",
          headerTooltip: "Sub-Type",
          tooltipField: "errorTypeText",
          filter: "agTextColumnFilter",
          width: 150,
        },
        {
          headerName: "Description",
          field: "description",
          headerTooltip: "Description",
          tooltipField: "description",
          filter: "agTextColumnFilter",
          width: 270,
        },
        {
          headerName: "Number",
          field: "ticketNumber",
          headerTooltip: "Ticket Number",
          tooltipField: "ticketNumber",
          filter: "agTextColumnFilter",
          width: 100,
          type: 'numericColumn'
        }
      ];
      this.detailRowHeight = 155;
      const self = this;
      this.detailCellRendererParams = {
        detailGridOptions: {
          columnDefs: [
            // {
            //   headerName: '', field: 'feedback', suppressMovable: true, suppressMenu: true, width: 30,
            //   cellRenderer: params => {
            //     if (self.showfeedback) {
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
              headerName: '', field: 'hasDocument', suppressMovable: true, suppressMenu: true, width: 30,
              cellRenderer: params => {
                if (params.value == 'true') {
                  return ` <img title="Attachment" style="width: 16px; float: left;padding-top:5px"  src="assets/images/attechment_icon.png">`
                }
              }, tooltip: () => {
                return '';
              }
            },
            { headerName: 'Type', field: 'typeWithDirection', suppressMovable: true, headerTooltip: "Type", suppressMenu: true, width: 150, sortable: true, },
            { headerName: 'Subject', field: 'subject', suppressMovable: true, headerTooltip: "Subject", suppressMenu: true, width: 250, sortable: true },
            {
              headerName: 'Responsible', sortable: true, field: 'responsiblePerson', suppressMovable: true,
              suppressMenu: true, headerTooltip: "Responsible", width: 200,
            },
            {
              headerName: 'P', headerTooltip: "Priority", field: 'priority_value', suppressMovable: true,
              suppressMenu: true, width: 200,
              cellRenderer: params => {
                switch (params.data.priority) {
                  case 'Immediate':
                    return `<img style="cursor: pointer; padding-bottom: 10px;" height = "25px" width = "20px" alt = "Immediate" title = "Immediate" src = "assets/images/priority_immediate.gif" >`
                  case 'High':
                    return `<img style="cursor: pointer; padding-bottom: 10px;" height = "25px" width = "25px" alt = "High" title = "High" src = "assets/images/priority_high.gif" >`
                  case 'Normal':
                    return `<img style="cursor: pointer; padding-bottom: 10px;" height = "25px" width = "25px" alt = "Normal" title = "Normal" src = "assets/images/priority_normal.gif" >`
                  case 'Low':
                    return `<img style="cursor: pointer; padding-bottom: 10px;" height = "25px" width = "25px" alt = "Low" title = "Low" src = "assets/images/priority_low.gif" >`
                  default:
                    break;
                }
              }, tooltip: () => {
                return '';
              }
            },
            { headerName: 'Status', field: 'status', headerTooltip: "Status", suppressMovable: true, suppressMenu: true, width: 150, sortable: true },
            { headerName: 'Planned', field: 'plannedDateTime', headerTooltip: "Planned", suppressMovable: true, width: 130, sortable: true },
            { headerName: 'Actual', headerTooltip: "Actual Datetime", field: 'datetime', suppressMovable: true, suppressMenu: true, width: 150, sortable: true },
          ],

          onFirstDataRendered(params) {
            params.api.sizeColumnsToFit();
          },
          // getRowHeight() {
          //   const isDetailRow = self.res;
          //   if (isDetailRow) {
          //     const detailPanelHeight = 40
          //     return detailPanelHeight;
          //   } else {
          //     return 40;
          //   }
          // },
          onRowClicked(e) {
            if (e.event.target !== undefined) {
              const data = e.data;
              const actionType = e.event.target.getAttribute('data-action-type');
              switch (actionType) {
                //   case 'download':
                //     return self.download(e);
                default:
                  self.masterGridClicked = false;
                  self.openDetailActivity(e);
              }

            }
          },
          rowClassRules: {
            'highlightSelectedActivity': (params) => {
              // return params.data.id === this.selectedActId
              if (this.opendedTickets && this.opendedTickets.length > 0) {
                for (let index in this.opendedTickets) {
                  if (this.opendedTickets[index] === params.data.id) {
                    return true;
                  }
                }
              } else {
                if (this.lastOpenedTicket == params.data.id) {
                  return true;
                }

              }
            },
          }
        },
        getDetailRowData(params) {
          params.successCallback(params.data.activityDetails);
          if (!self.masterGridClicked) {
            self.detailActivityDetailsArr = [];
            self.detailActivityDetailsArr.push(params.data.activityDetails);
          }
        },

        //     template: function (params) {
        //       var dataLength = params.data.activityDetails.length;
        //       if (dataLength) {
        //         return (
        //           '<div style="height:100%;padding: 20px; box-sizing: border-box;">' +
        //           '  <div style="height: 10%;">Activity (' +
        //           dataLength +
        //           ")</div>" +
        //           '  <div ref="eDetailGrid" style="height: ' + dataLength * 40 + '%"></div>' +
        //           "</div>"
        //         );
        //       } else {
        //         return (
        //           `<div class="no-found mt-3 ml-2">
        //                <p class="mb-0"></p>
        //                 </div>`
        //         )
        //       }
        //     }
        // template: function (params) {
        //   var dataLength = params.data.activityDetails.length;
        //   return (`<div>Activity (${dataLength})</div><div ref="eDetailGrid"></div>`)
        // }
      };
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
        enableBrowserTooltips: true,

      };
      this.getRowHeight = function (params) {
        if (params.node && params.node.detail) {
          var offset = 50;
          if (params.data.activityDetails.length > 0) {
            var allDetailRowHeight = params.data.activityDetails.length * 26;
            return allDetailRowHeight + offset;
          } else {
            return 100;
          }
        } else {
          return 26;
        }
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
      this.rowClassRules = {
        'highlightSelectedActivity': (params) => {
          // return params.data.id === this.selectedActId
          if (params && params.data) {
            if (this.opendedTickets && this.opendedTickets.length > 0) {
              for (let index in this.opendedTickets) {
                if (this.opendedTickets[index] === params.data.id) {
                  return true;
                }
              }
            } else {
              if (this.lastOpenedTicket == params.data.id) {
                return true;
              }
            }
          }
        },
      };
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @param {*} params
   * @memberof TicketSearchComponent
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
  }

  openDetailActivity(e) {
    this.ticketActivityOverlayService.preserveGridData(this.detailActivityDetailsArr[0]);
    const isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'activity');
    if (!isOpen) {
      this.opendedDetailActivity.push(e.data.id);
    }
    this.gridApi.redrawRows();
    this.CDRService.callDetectChanges(this.cdr);
  }

  onSortChanged(): void {
    const filteredActivityArray = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      filteredActivityArray.push(node.data);
    });
    if (this.opendedTickets && this.opendedTickets.length > 0) {
      for (const actId of this.opendedTickets) {
        this.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, filteredActivityArray);
      }
    } else {
      this.ticketActivityOverlayService.preserveGridData(filteredActivityArray);
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @param {*} e
   * @memberof TicketSearchComponent
   */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "goToCustomerCart":
          this.goToCustomerCart(e.data.customerId);
          break;
        default:
          this.masterGridClicked = true;
          this.checkTicketAlreadyOpenOrNot(e);
      }
    }
  }


  public goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  checkTicketAlreadyOpenOrNot(e) {
    let isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'ticket')
    if (!isOpen) {
      this.opendedTickets.push(e.data.id);
      this.lastOpenedTicket = undefined;
      this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
    }
    this.gridApi.redrawRows();
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description get available tickets
   * @updatedate 19-12-2019
   * @updatedby manali joshi
   * @memberof TicketSearchComponent
   */
  public _initAvailableTicket(data?): void {
    const self = this;
    // set serach criteria  to local storage for preserve its state for future
    const ticketSearchData = JSON.parse(JSON.stringify(this.ticketSearchForm.value));
    this.localStorageUtilityService.addToLocalStorage('ticketSearchObject', ticketSearchData);
    if (!data) {
      if (this.ticketSearchForm.value && this.ticketSearchForm.value['returnFullResult']) {
        delete this.ticketSearchForm.value['returnFullResult'];
      }
      self.ticketSearchService
        .searchData(this.ticketSearchForm.value)
        .then(
          (response: any) => {
            self.availableTicket = response;
            if (response.data && response.data.counter) {
              this.dialogService.custom(ConfirmLargedataDialogComponent, { searchdata: this.ticketSearchForm.value, counter: response.data.counter, resultLength: response.data.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
                (response) => {
                  if (response) {
                    this.localStorageUtilityService.addToLocalStorage('ticketSearchObject', response);
                    this.preserveLocalStorageData = response;
                    this.ticketSearchService.searchData(response).then((result: any) => {
                      self.availableTicket = result;
                      result.data.forEach(element => {
                        if (element.activityDetails && element.activityDetails.length > 0) {
                          element.activityDetails.forEach(item => {
                            item.typeWithDirection = item.type + '-' + item.direction
                          });
                        }
                        if (element.customerInfo && element.customerInfo.salesProcessStatus) {
                          element.sps = element.customerInfo.salesProcessStatus;
                        } else {
                          element.sps = '';
                        }
                      });
                      this.rowData = result.data;
                      if (self.opendedDetailActivity && self.opendedDetailActivity.length > 0) {
                        for (const actId of self.opendedDetailActivity) {
                          self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
                        }
                      } else {
                        self.ticketActivityOverlayService.preserveGridData(self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
                      }
                      self.CDRService.callDetectChanges(self.cdr);

                    });
                  }
                }, (error) => {
                  console.error(error);
                }
              );
            } else {
              if (self.opendedDetailActivity && self.opendedDetailActivity.length > 0) {
                for (const actId of self.opendedDetailActivity) {
                  self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
                }
              } else {
                self.ticketActivityOverlayService.preserveGridData(self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
              }
              if (response && response.data) {
                response.data.forEach(element => {
                  if (element.activityDetails && element.activityDetails.length > 0) {
                    element.activityDetails.forEach(item => {
                      item.typeWithDirection = item.type + '-' + item.direction
                    });
                  }
                  if (element.customerInfo && element.customerInfo.salesProcessStatus) {
                    element.sps = element.customerInfo.salesProcessStatus;
                  } else {
                    element.sps = '';
                  }
                });
                self.rowData = response.data;
                self.CDRService.callDetectChanges(self.cdr);
              }
            }
          },
          error => {
            console.log(error);
          }
        );
    } else {
      if (this.preserveLocalStorageData && Object.keys(this.preserveLocalStorageData).length > 0) {
        if (this.preserveLocalStorageData.returnFullResult) {
          ticketSearchData['returnFullResult'] = true;
        } else {
          ticketSearchData['returnFullResult'] = false;
        }
      }
      this.ticketSearchService.searchData(ticketSearchData).then((result: any) => {
        self.availableTicket = result;
        if (result && result.data && !result.data.counter) {
          result.data.forEach(element => {
            if (element.activityDetails && element.activityDetails.length > 0) {
              element.activityDetails.forEach(item => {
                item.typeWithDirection = item.type + '-' + item.direction
              });
            }
            if (element.customerInfo && element.customerInfo.salesProcessStatus) {
              element.sps = element.customerInfo.salesProcessStatus;
            } else {
              element.sps = '';
            }
          });
        }
        this.rowData = result.data;
        if (self.opendedDetailActivity && self.opendedDetailActivity.length > 0) {
          for (const actId of self.opendedDetailActivity) {
            self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
          }
        } else {
          self.ticketActivityOverlayService.preserveGridData(self.availableTicket && self.availableTicket.data && self.availableTicket.data.length > 0 ? self.availableTicket.data : []);
        }
        self.CDRService.callDetectChanges(self.cdr);

      });
    }


  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @memberof TicketSearchComponent
   */
  public search(data?): void {
    this._initAvailableTicket(data);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @memberof TicketSearchComponent
   */
  public resetFilter() {
    this.ticketSearchLookup.errorTypeList = [];
    this.ticketSearchForm.reset();
    this.availableTicket = undefined;
    this.onDateChange();
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @memberof TicketSearchComponent
   * @updatedate 19-12-2019
   * @updatedby manali joshi
   */
  public clearSearch() {
    this.ticketSearchLookup.errorTypeList = [];
    this.ticketSearchForm.reset();
    this.availableTicket = undefined;
    this.onDateChange();
    // remove activity Search object from local storage to reset search filters
    this.localStorageUtilityService.removeFromLocalStorage('ticketSearchObject');
  }

  onDateChange() {
 //   setTimeout(() => {
      this.CDRService.callDetectChanges(this.cdr);
   // }, 500);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description function call to select all value from lookup
   * @param {string} multipleSelectfor
   * @memberof TicketSearchComponent
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "year":
        selected = [];
        selected = this.ticketSearchLookup.yearList.map(
          item => item.id
        );
        this.ticketSearchForm.get("year").patchValue(selected);
        break;
      case "department":
        selected = [];
        selected = this.ticketSearchLookup.departmentList.map(
          item => item.id
        );
        this.ticketSearchForm.get("department").patchValue(selected);
        break;
      case "reseller":
        selected = [];
        selected = this.ticketSearchLookup.resellerList.map(
          item => item.id
        );
        this.ticketSearchForm.get("resellerId").patchValue(selected);
        break;
      case "salesProcessStatus":
        selected = [];
        selected = this.ticketSearchLookup.salesProcessStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("salesProcessStatus").patchValue(selected);
        break;
      case "preferredLanguage":
        selected = [];
        selected = this.ticketSearchLookup.preferredLanguageList.map(
          item => item.id
        );
        this.ticketSearchForm.get("preferredLanguage").patchValue(selected);
        break;
      case "ticketStatus":
        selected = [];
        selected = this.ticketSearchLookup.ticketStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("ticketStatus").patchValue(selected);
        break;
      case "typeText":
        selected = [];
        selected = this.ticketSearchLookup.ticketTypeList.map(
          item => item.id
        );
        this.ticketSearchForm.get("typeText").patchValue(selected);
        break;
      case "outcome":
        selected = [];
        selected = this.ticketSearchLookup.outcomeList.map(
          item => item.id
        );
        this.ticketSearchForm.get("outcome").patchValue(selected);
        break;
      case "resolution":
        selected = [];
        selected = this.ticketSearchLookup.resolutionList.map(
          item => item.id
        );
        this.ticketSearchForm.get("resolution").patchValue(selected);
        break;
      case "efileReadyStatus":
        selected = [];
        selected = this.ticketSearchLookup.efileReadinessStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("efileReadyStatus").patchValue(selected);
        break;
      case "bankEnrollmentStatus":
        selected = [];
        selected = this.ticketSearchLookup.bankEnrollmentStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("bankEnrollmentStatus").patchValue(selected);
        break;
      case "trainingStatus":
        selected = [];
        selected = this.ticketSearchLookup.trainingStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("trainingStatus").patchValue(selected);
        break;
      case "paymentStatus":
        selected = [];
        selected = this.ticketSearchLookup.paymentStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("paymentStatus").patchValue(selected);
        break;
      case "conversionStatus":
        selected = [];
        selected = this.ticketSearchLookup.conversionStatusList.map(
          item => item.id
        );
        this.ticketSearchForm.get("conversionStatus").patchValue(selected);
        break;
      case "loginStatus":
        selected = [];
        selected = this.ticketSearchLookup.loginStatus.map(
          item => item.id
        );
        this.ticketSearchForm.get("loginStatus").patchValue(selected);
        break;
      case "errorType":
        selected = [];
        selected = this.ticketSearchLookup.errorTypeList.map(
          item => item.id
        );
        this.ticketSearchForm.get("errorType").patchValue(selected);
        break;
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof TicketSearchComponent
   */
  public onClearAll(clearSelectfor) {
    this.ticketSearchForm.get(clearSelectfor).patchValue([]);

  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23/10/2019
   * @description close deop-down
   * @param {NgSelectComponent} select
   * @memberof CustomerSearchComponent
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 22-10-2019
   * @memberof TicketSearchComponent
   */
  public initTicketSearchForm() {
    this.ticketSearchForm = this.fb.group({
      year: [''],
      department: [''],
      customerName: '',
      customerNr: '',
      resellerId: [''],
      salesProcessStatus: [''],
      preferredLanguage: [''],
      isTestCustomer: false,
      isCurrentRefundRequest: [null],
      isRefundRequestDenied: [null],
      ticketNr: '',
      ticketStatus: [''],
      typeText: [''],
      errorType: [''],
      description: '',
      outcome: [''],
      resolution: [''],
      isErrorTypeOther: [null],
      isErrorTypeLater: [null],
      dateFrom: '',
      dateTo: '',
      updatedDateFrom: '',
      updatedDateTo: '',
      efileReadyStatus: [''],
      bankEnrollmentStatus: [''],
      trainingStatus: [''],
      paymentStatus: [''],
      conversionStatus: [''],
      proformaStatus: [''],
      loginStatus: [''],
      isFullView: false,
      isEditMode: false
    })
    this.formValueChange();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 23-10-2019
   * @description function call on form value change
   * @private
   * @memberof TicketSearchComponent
   */
  private formValueChange() {
    if (this.ticketSearchForm.value) {
      this.ticketSearchForm.controls.isFullView.valueChanges.subscribe(data => {
        if (data) {
          this.loaderService.show();
        //  this.ticketSearchForm.controls.isFullView.disable();
          // setTimeout(() => {
          //   this.loaderService.show();
          // }, 0)
          // this.CDRService.callDetectChanges(this.cdr);
          // expand all detail grid
          this.gridApi.forEachNode((node) => {
            if (node.data.activityDetails.length > 0) {
              node.setExpanded(true);
            }
          });
          this.loaderService.hide();
        //  this.ticketSearchForm.controls.isFullView.enable();
          // setTimeout(() => {
          //   this.loaderService.hide();
          // }, 2000)
          // this.showLoading = false;
          // this.CDRService.callDetectChanges(this.cdr);
        } else {
          this.loaderService.show();
        //  this.ticketSearchForm.controls.isFullView.disable();
          // // collapsed all detail grid
          // setTimeout(() => {
          //   this.loaderService.show();
          // }, 0)
          if (this.gridApi) {
            this.gridApi.forEachNode((node) => {
              node.setExpanded(false);
            });
          }
          this.loaderService.hide();
         // this.ticketSearchForm.controls.isFullView.enable();
          // setTimeout(() => {
          //   this.loaderService.hide();
          // }, 2000)
          // setTimeout(()=>{
          //   this.loaderService.show();
          // }, 0)
        }
        //   setInterval(() =>{
        //     this.loaderService.hide();
        //   }, 1000)
      });

      this.ticketSearchForm.controls.typeText.valueChanges.subscribe(data => {
        if (data && data.length === 1) {
          this.ticketTypeChange(data[0]);
        }
        else {
          this.ticketSearchLookup.errorTypeList = [];
          this.ticketSearchForm.controls.errorType.setValue(undefined)
        }
      });
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 22-10-2019
   * @description based on typeText get errorTypeList lookup
   * @updatedBy Mansi Makwana
   * @updatedDate 06-02-2020
   * @param {string} typeText
   * @memberof TicketSearchComponent
   */
  public ticketTypeChange(data) {
    let typeId = data;
    for (let keys in this.ticketSearchLookup.allLookupDataForTicket) {
      let isExists = this.ticketSearchLookup.allLookupDataForTicket[keys].findIndex(t => t.id === typeId);
      if (isExists !== -1) {
        this.ticketSearchLookup.errorTypeList = [];
        for (let obj of this.ticketSearchLookup.allLookupDataForTicket[keys][isExists].subTypeList) {
          if (obj.status === 0) {
            this.ticketSearchLookup.errorTypeList.push({ id: obj.id, name: obj.name });
          }
        }
      } else {
        this.ticketSearchLookup.errorTypeList = [];
        this.ticketSearchForm.controls.errorType.setValue(undefined);
      }
    }

  }

  /**
   * @author Dhruvi Shah
   * @createdDate 22-10-2019
   * @description get lookup val
   * @memberof TicketSearchComponent
   */
  public getLookupForTicket() {
    const self = this;
    self.isSearchDisable = true;
    self.ticketSearchService.getLookupForTicket().then(
      (response: any) => {
        self.isSearchDisable = false;
        this.ticketSearchLookup.departmentList = response.departmentList;
        this.ticketSearchLookup.ticketStatusList = response.ticketStatusList;
        this.ticketSearchLookup.salesProcessStatusList = response.salesProcessStatusList;
        this.ticketSearchLookup.stateList = response.stateList;
        this.ticketSearchLookup.ticketTypeList = response.ticketTypeList;
        this.ticketSearchLookup.outcomeList = response.outcomeList;
        this.ticketSearchLookup.resolutionList = response.resolutionList;
        this.ticketSearchLookup.resellerList = response.resellerList;
        this.ticketSearchLookup.preferredLanguageList = response.preferredLanguageList;
        this.ticketSearchLookup.allLookupDataForTicket = response.allLookupDataForTicket;
        this.ticketSearchLookup.yearList = response.yearList.reverse();
        this.CDRService.callDetectChanges(this.cdr);
      },
      error => {
        console.error(error);
      }
    );
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 22-10-2019
   * @description get lookup val for SeasonReadiness
   * @memberof TicketSearchComponent
   */
  public getLookupForTicketSeasonReadiness() {
    const self = this;
    self.isSearchDisable = true;
    self.ticketSearchService.getLookupForTicketSeasonReadiness().then(
      (response: any) => {
        self.isSearchDisable = false;
        if (response) {
          this.ticketSearchLookup.efileReadinessStatusList = response.efileReadinessStatus;
          this.ticketSearchLookup.trainingStatusList = response.trainingStatus;
          this.ticketSearchLookup.bankEnrollmentStatusList = response.bankEnrollmentStatus;
          this.ticketSearchLookup.conversionStatusList = response.conversionsStatus;
          this.ticketSearchLookup.proformaStatusList = response.proformaStatus;
          this.ticketSearchLookup.paymentStatusList = response.paymentStatus;
          this.ticketSearchLookup.loginStatus = response.loginStatus;
          this.CDRService.callDetectChanges(this.cdr);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
  * @author Manali Joshi
  * @createdDate 19-12-2019
  * @memberof TicketSearchComponent
  */
  // Search Criteria List
  getAllTicketSearchCriteriaList(): void {
    const self = this;
    this.ticketSearchService.GetTicketSearchCriteriaList().then(response => {
      self.SearchCriteriaList = response ? response : undefined;
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof TicketSearchComponent
   */
  // Todo : Remove function when testing done,
  // open dialog for new filter save
  newFilterDialog(): void {
    const self = this;
    // pass search criteria from local storage in data before opening dialog
    if (this.localStorageUtilityService.checkLocalStorageKey('ticketSearchObject')) {
      // Todo
      let data = { 'TicketSearchCriteria': this.localStorageUtilityService.getFromLocalStorage('ticketSearchObject'), 'screen': 'ticket' };
      this.dialogService.custom(SaveNewFilterDialogComponent, data, { keyboard: true, backdrop: 'static', size: 'md' }).result.then(
        (response) => {
          if (response) {
            self.getAllTicketSearchCriteriaList();
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
   * @memberof TicketSearchComponent
   */
  // when user update exsting filter
  updateFilter(filterID: any, filterName: any): void {
    const self = this;
    if (self.localStorageUtilityService.checkLocalStorageKey('ticketSearchObject')) {
      // Open dialog for conformation before Change
      const dialogData = { title: 'Confirmation', text: `Are you sure you want to update ${filterName} filter?<br> Please make sure you have pressed the search button before saving this filter.  ` };
      this.dialogService.confirm(dialogData, {}).result.then(
        (result) => {
          if (result === 'YES') {
            // object with id and new search criteria
            const objectTicketSearchCriteria = { 'id': filterID, 'filterCriteria': self.localStorageUtilityService.getFromLocalStorage('ticketSearchObject'), type: 'ticket' };
            self.saveTicketFilter(objectTicketSearchCriteria);
          }
        }, (error) => {
          self.messageService.showMessage('Error occurred while processing.', 'error');
        });
    }
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof TicketSearchComponent
   */
  public saveTicketFilter(param: any): void {
    this.ticketSearchService.saveTicketSFilter(param).then(response => {
      console.log(response);
      this.messageService.showMessage('Filter updated successfully', 'success');
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof TicketSearchComponent
   */
  // Loading Saved Filter
  public loadFilter(filterID: any): void {
    // call api and get search criteria from api
    this.ticketSearchService.getTicketSFilterByID({ id: filterID }).then(response => {
      if (response && response['TicketSearchCriteria']) {
        this.localStorageUtilityService.addToLocalStorage('ticketSearchObject', response['TicketSearchCriteria']);
        this.ticketSearchForm.patchValue(response['TicketSearchCriteria']);
      }
      // after response store that search criteria to local storage. If ASearchCriteria does not exist in response, this will work.
      if (response && !response['TicketSearchCriteria']) {
        this.localStorageUtilityService.addToLocalStorage('ticketSearchObject', response);
        this.ticketSearchForm.patchValue(response);
      }
      this.search();
      this.CDRService.callDetectChanges(this.cdr);
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 19-12-2019
   * @memberof TicketSearchComponent
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
          this.ticketSearchService.deleteSavedTicketSFilter({ 'id': id }).then(response => {
            if (response === true) {
              setTimeout(()=>{
                self.getAllTicketSearchCriteriaList();
              },1000);
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
   * @author Dhruvi Shah
   * @createdDate 22-10-2019
   * @updatedate 19-12-2019
   * @updatedby manali joshi
   * @memberof TicketSearchComponent
   */
  ngOnInit(): void {
    this.userDetails = this.userService.getUserDetail();
    this.showfeedback = this.userService.showFeedback();
    this.getLookupForTicket();
    this.getLookupForTicketSeasonReadiness();
    this.initTicketSearchForm();
    this.getAllTicketSearchCriteriaList();
    // if localstorage allready contains serach value then assign to search form and load data accordingly
    if (this.localStorageUtilityService.checkLocalStorageKey('ticketSearchObject')) {
      this.preserveLocalStorageData = this.localStorageUtilityService.getFromLocalStorage('ticketSearchObject');
      this.ticketSearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('ticketSearchObject'));
      this.search(true);
    }

    if (this.localStorageUtilityService.checkLocalStorageKey("openActivityTabLocalStorageData")) {
      const minimizedActivityIds = this.localStorageUtilityService.getFromLocalStorage("openActivityTabLocalStorageData");
      if (minimizedActivityIds && minimizedActivityIds.length > 0) {
        for (const obj of minimizedActivityIds) {
          this.opendedTickets.push(obj.screen == 'activity' ? obj.activityId : obj.ticketId);
          this.lastOpenedTicket = undefined;
          this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
        }
      }
    }

    if (this.localStorageUtilityService.checkLocalStorageKey("lastOpenedID")) {
      this.lastOpenedTicket = this.localStorageUtilityService.getFromLocalStorage("lastOpenedID");
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.redrawRows();
        }
      }, 3000);
    }

    this.gridHighlightWatcher = this.ticketActivityOverlayService.gridHighlight.subscribe((result: any) => {
      if (result) {
        const index = this.opendedTickets.findIndex(openId => openId === result.prev);
        if (index > -1) {
          this.opendedTickets.splice(index, 1);
        }
        this.opendedTickets.push(result.current);
        this.lastOpenedTicket = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
        this.gridApi.redrawRows();
      }
    });

    this.arrayListWatcher = this.ticketActivityOverlayService.arrayList.subscribe((result: any) => {
      const opendedActivitiesFromHeader = result.list.map((openActivity: any) => openActivity.id);
      if (opendedActivitiesFromHeader.length !== this.opendedTickets.length && result.type !== 'maximized') {
        if (this.opendedTickets && this.opendedTickets.length == 1 && (!opendedActivitiesFromHeader || opendedActivitiesFromHeader.length == 0)) {
          if (this.regexForGUID.test(this.opendedTickets[0])) {
            this.lastOpenedTicket = this.opendedTickets[0];
            this.localStorageUtilityService.addToLocalStorage('lastOpenedID', this.lastOpenedTicket);
          }

        }
        this.opendedTickets = opendedActivitiesFromHeader;
      }
      if (this.opendedTickets && this.opendedTickets.length > 0) {
        this.lastOpenedTicket = undefined;
        this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
      }
      this.gridApi.redrawRows();
    });

    this.closeActivityWatcher = this.ticketActivityOverlayService.closeActivityId.subscribe((closeActivityId: any) => {
      if (this.opendedTickets && this.opendedTickets.length > 0) {
        let i = this.opendedTickets.findIndex(openTicketId => openTicketId === closeActivityId);
        if (i > -1) {
          this.opendedTickets.splice(i, 1);
        }
      }
      if (!this.opendedTickets || this.opendedTickets.length == 0) {
        if (this.regexForGUID.test(closeActivityId)) {
          this.lastOpenedTicket = closeActivityId;
          this.localStorageUtilityService.addToLocalStorage('lastOpenedID', this.lastOpenedTicket);
        }

      }
      this.gridApi.redrawRows();
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
