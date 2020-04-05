// External imports
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, ViewEncapsulation } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, FormControl } from "@angular/forms";
import { ColDef } from "ag-grid-community";
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

// Internal imports
import { UserService, CDRService } from '@app/shared/services';
import { CustomerTicketService } from '@app/customer/customer-ticket/customer-ticket.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';

@Component({
  selector: 'app-customer-ticket',
  templateUrl: 'customer-ticket.component.html',
  styleUrls: ['./customer-ticket.component.scss'],
  providers: [CustomerTicketService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class CustomerTicketComponent implements OnInit {

  @Input('customerID') customerID: string;
  @Input('isTestCustomer') isTestCustomer: boolean;

  //
  customerTicketForm: FormGroup;
  public userDetails: any = {};
  public ticketLookup: any = {};
  public startRefresh: boolean = false;
  public availableActivityWithTicketData: { data: any; total: any };
  //
  public ticketSearchForm: FormGroup;
  public rowData: any = [];
  public defaultColDef: any;
  public sideBar: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: ColDef[];
  public detailCellRendererParams;
  public getRowHeight;
  public opendedDetailActivity: any = [];
  public rowClassRules: any;
  public opendedTickets = [];
  public lastOpenedTicket = '';
  public masterGridClicked: boolean;
  public detailActivityDetailsArr: any[];
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  public gridHighlightWatcher: Subscription;
  public arrayListWatcher: Subscription;
  public closeActivityWatcher: Subscription;
  private integrityServiceSubscription: Subscription;


  public ticketCustomerTab: Subscription;
  constructor(private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService: UserService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private customerTicketService: CustomerTicketService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) {
    {
      this.columnDefs = [
        {
          headerName: "Year",
          field: "year",
          headerTooltip: "Year",
          filter: "agTextColumnFilter",
          width: 100,
          cellRenderer: 'agGroupCellRenderer'

        },
        {
          headerName: "Department",
          field: "department",
          headerTooltip: "Department",
          filter: "agTextColumnFilter",
          tooltipField: "department",
          width: 150,
        },
        {
          headerName: "Status",
          field: "ticketStatusText",
          headerTooltip: "Ticket Status",
          tooltipField: "ticketStatusText",
          filter: "agTextColumnFilter",
          width: 200
        },
        {
          headerName: "Ticket Type",
          field: "typeText",
          headerTooltip: "Ticket Type",
          tooltipField: "typeText",
          filter: "agTextColumnFilter",
          width: 320,
        },
        {
          headerName: "Sub-Type",
          field: "errorTypeText",
          headerTooltip: "Sub-Type",
          tooltipField: "errorTypeText",
          filter: "agTextColumnFilter",
          width: 460,
        },
        {
          headerName: "Description",
          field: "description",
          headerTooltip: "Description",
          tooltipField: "description",
          filter: "agTextColumnFilter",
          width: 250,
        },
        {
          headerName: "Number",
          field: "ticketNumber",
          type: 'numericColumn',
          headerTooltip: "Ticket Number",
          tooltipField: "ticketNumber",
          filter: "agTextColumnFilter",
          width: 100,
        }
      ];
      const self = this;
      this.detailCellRendererParams = {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: '', field: 'hasDocument', suppressMovable: true, suppressMenu: true, width: 40, autoHeight: true,
              cellRenderer: params => {
                if (params.value == 'true') {
                  return ` <img title="Attachment" style="width: 16px; float: left;padding-top:5px"  src="assets/images/attechment_icon.png">`
                }
              },
              tooltip: () => {
                return '';
              }
            },
            {
              headerName: 'Type', field: 'type', suppressMovable: true, suppressMenu: true, width: 200, sortable: true, autoHeight: true,
              cellRenderer: params => {
                return params.data.type + '-' + params.data.direction
              }
            },
            { headerName: 'Subject', field: 'subject', tooltipField: 'subject', suppressMovable: true, suppressMenu: true, width: 450, sortable: true },
            {
              headerName: 'Responsible', sortable: true, field: 'responsiblePerson', suppressMovable: true,
              suppressMenu: true, width: 350, autoHeight: true,
            },
            {
              headerName: 'P', headerTooltip: "Priority", field: 'priority_value', suppressMovable: true, sortable: true,
              suppressMenu: true, width: 100, autoHeight: true,
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
              },
              tooltip: () => {
                return '';
              }
            },
            { headerName: 'Status', field: 'status', suppressMovable: true, suppressMenu: true, width: 250, sortable: true, autoHeight: true },
            {
              headerName: 'Planned', field: 'plannedDateTime', suppressMovable: true, width: 180, sortable: true, autoHeight: true,
              cellRenderer: params => {
                if (params.value) {
                  return moment(params.value).format('MM/DD/YY hh:mm A')
                }
              }
            },
            {
              headerName: 'Actual', headerTooltip: "Actual Datetime", field: 'datetime', suppressMovable: true, suppressMenu: true, width: 180, sortable: true, sort: 'desc', autoHeight: true,
              cellRenderer: params => {
                if (params.value) {
                  return moment(params.value).format('MM/DD/YY hh:mm A')
                }
              }
            },
          ],

          onFirstDataRendered(params) {
            params.api.setDomLayout("autoHeight");
            //params.api.sizeColumnsToFit();
          },
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
        onGridReady: function (params) {
          params.api.setDomLayout("autoHeight");
        },
        getDetailRowData(params) {
          params.successCallback(params.data.activityDetails);
          if (!self.masterGridClicked) {
            self.detailActivityDetailsArr = [];
            self.detailActivityDetailsArr.push(params.data.activityDetails);
          }
        },

        // template: function (params) {
        //   var dataLength = params.data.activityDetails.length;
        //   if (dataLength) {
        //     return (
        //       '<div style="height:100%;padding: 20px; box-sizing: border-box;">' +
        //       '  <div style="height: 10%;">Activity (' +
        //       dataLength +
        //       ")</div>" +
        //       '  <div ref="eDetailGrid" style="height: ' + dataLength * 22 + '%"></div>' +
        //       "</div>"
        //     );
        //   } else {
        //     return (`<div class="no-found mt-3 ml-4">
        //            <p class="mb-0">No Data Available</p>
        //             </div>`)
        //   }
        // }

      };

      this.defaultColDef = {
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        resizable: true,
        suppressMenu: false,
        lockPosition: true,
        tooltip: (p: any) => {
          return p.value;
        },
        suppressMaxRenderedRowRestriction: true,
        suppressColumnVirtualisation: true
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
      };
    }
  }

  onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @param {*} params
   * @memberof CustomerTicketComponent
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

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @param {*} e
   * @memberof CustomerTicketComponent
   */
  public onRowClicked(e) {
    // if (e.event.target !== undefined) {
    //   const actionType = e.event.target.getAttribute("data-action-type");
    //   switch (actionType) {
    //     case "goToCustomerCart":
    //       this.goToCustomerCart(e.data.customerId);
    //     default:
    //       this.openWindow(e.data.id);
    //   }
    // }
    if (e.event.target !== undefined) {
      this.checkTicketAlreadyOpenOrNot(e);
    }
  }

  openDetailActivity(e) {
    if (this.detailActivityDetailsArr[0]) {
      this.ticketActivityOverlayService.preserveGridData(_.reverse(this.detailActivityDetailsArr[0]));
    }
    const isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'activity');
    if (!isOpen) {
      this.opendedDetailActivity.push(e.data.id);
    }
    this.gridApi.redrawRows();
    this.CDRService.callDetectChanges(this.cdr);
  }

  goToCustomerCart(customerId): void {
    window.open('/#/customer/edit/' + customerId, '_blank');
  };

  checkTicketAlreadyOpenOrNot(e) {
    let isOpen = this.ticketActivityOverlayService.checkActivityAlreadyOpenOrNot(e.data.id, 'ticket')
    if (!isOpen) {
      this.opendedTickets.push(e.data.id);
      this.lastOpenedTicket = undefined;
      this.localStorageUtilityService.removeFromLocalStorage('lastOpenedID');
    }
    this.gridApi.redrawRows();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description select all values from drop-down
   * @param {*} multipleSelectfor
   * @memberof CustomerTicketComponent
   */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'ticketStatus':
        selected = [];
        selected = this.ticketLookup.ticketStatusList.map(
          item => item.id
        );
        this.customerTicketForm.get('ticketStatus').patchValue(selected);
        break;
      case 'year':
        selected = [];
        selected = this.ticketLookup.yearList.map(
          item => item.id
        );
        this.customerTicketForm.get('year').patchValue(selected);
        break;
    }
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description function call to clear all selected val from lookup
   * @param {*} clearSelectfor
   * @memberof CustomerTicketComponent
   */
  public onClearAll(clearSelectfor): void {
    this.customerTicketForm.get(clearSelectfor).patchValue([]);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description function call to close lookup
   * @param {NgSelectComponent} select
   * @memberof CustomerTicketComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description function call to search ticket data
   * @memberof CustomerTicketComponent
   */
  public search() {
    this.startRefresh = true;
    const self = this;
    if (self.customerTicketForm && self.customerTicketForm.value) {
      self.customerTicketService.searchData(self.customerTicketForm.value, this.customerID, this.isTestCustomer).then(
        (response: any) => {
          this.rowData = response.data;
          if (self.opendedTickets && self.opendedTickets.length > 0) {
            for (const actId of self.opendedTickets) {
              self.ticketActivityOverlayService.reIntializeHeaderAferSearchCriteriaChange(actId, self.rowData);
            }
          } else {
            self.ticketActivityOverlayService.preserveGridData(self.rowData);
          }
          response.data.forEach(element => {
            element.activityDetails.forEach(t => {
              if (t.datetime) {
                t.datetime = moment(t.datetime, 'MM/DD/YY hh:mm A').utc().format();
              }
              if (t.plannedDateTime) {
                t.plannedDateTime = moment(t.plannedDateTime, 'MM/DD/YY hh:mm A').utc().format();
              }
            });
          });
          this.startRefresh = false;
          setTimeout(() => {
            if (this.customerTicketForm) {
              if (this.customerTicketForm.controls.isFullView.value) {
                // expand all detail grid
                this.gridApi.forEachNode((node) => {
                  node.setExpanded(true);
                });
              } else {
                // collapsed all detail grid
                if (this.gridApi) {
                  this.gridApi.forEachNode((node) => {
                    node.setExpanded(false);
                  });
                }
              }
            }
          }, 0);

          this.CDRService.callDetectChanges(this.cdr);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description function call to clear search and reset checkbox values
   * @memberof CustomerTicketComponent
   */
  public reset() {
    this.customerTicketForm.reset();
    (this.customerTicketForm.controls.department as FormArray).controls[2].setValue(true);
    this.search();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate  05/12/2019
   * @description get lookup val
   * @memberof CustomerTicketComponent
   */
  public getDepartmentLookUp() {
    const self = this;
    self.customerTicketService.getDepartmentLookUp().then(
      (response: any) => {
        this.ticketLookup.departmentList = response;
        this.addCheckboxes();
        this.search();
        this.CDRService.callDetectChanges(this.cdr);
      },
      error => {
        console.error(error);
      }
    );
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
  * @createdDate 05/12/2019
  * @description get lookup val
  * @memberof TicketSearchComponent
  */
  public getLookupForTicket() {
    const self = this;
    self.customerTicketService.getLookupForTicket().then(
      (response: any) => {
        this.ticketLookup.ticketStatusList = response.ticketStatusList;
        this.ticketLookup.yearList = response.yearList;
        this.CDRService.callDetectChanges(this.cdr);
        console.log(this.ticketLookup)
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @description function call on form value change
   * @public
   * @memberof CustomerTicketComponent
   */
  public formValueChange() {
    if (this.customerTicketForm.value) {
      this.customerTicketForm.controls.isFullView.valueChanges.subscribe(data => {
        if (data) {
          // expand all detail grid
          this.gridApi.forEachNode((node) => {
            node.setExpanded(true);
          });
        } else {
          // collapsed all detail grid
          if (this.gridApi) {
            this.gridApi.forEachNode((node) => {
              node.setExpanded(false);
            });
          }
        }
      });
      this.customerTicketForm.controls.isEditMode.valueChanges.subscribe(data => {
        this.gridApi.refreshView();
        this.gridApi.refreshCells();
      });
    }
  }

  /**
 * @author Dhruvi Shah
 * @createdDate  05/12/2019
 * @description add departments in array as control
 * @private
 * @memberof CustomerTicketComponent
 */
  private addCheckboxes() {
    if (this.ticketLookup.departmentList) {
      this.ticketLookup.departmentList.forEach((element, index) => {
        const control = new FormControl(index === 2); // if first item set to true, else false
        (this.customerTicketForm.controls.department as FormArray).push(control);
      });
    }
    this.CDRService.callDetectChanges(this.cdr);
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 05/12/2019
   * @memberof CustomerTicketComponent
   */
  createCustomerTicketForm() {
    this.customerTicketForm = this.fb.group({
      isFullView: this.fb.control(null),
      department: new FormArray([]),
      year: this.fb.control(null),
      ticketStatus: this.fb.control(null),
      isEditMode: false
    });
    this.addCheckboxes(); // add department checkboxes in array
    this.formValueChange(); // expand all grid
    this.CDRService.callDetectChanges(this.cdr);

  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.getDepartmentLookUp(); // department checkboxes
    this.getLookupForTicket();
    this.createCustomerTicketForm();

    this.ticketCustomerTab = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'ticketCustomer') {
        this.search();
      }
    });
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
    if (this.ticketCustomerTab) {
      this.ticketCustomerTab.unsubscribe();
    }
    if (this.closeActivityWatcher) {
      this.closeActivityWatcher.unsubscribe();
    }
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }
}
