//External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';

// Internal imports
import { UserService, CDRService } from '@app/shared/services';
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';


@Component({
  selector: 'mtpo-ta-customer-ticket',
  templateUrl: './ta-customer-ticket.component.html',
  styleUrls: ['./ta-customer-ticket.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TACustomerTicketComponent implements OnInit {
  @Input('activityId') currentActivityId;
  @Input() modelData: any = {};
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowSelection;
  public rowData = [this.domLayout = 'autoHeight'];
  public userDetails: any;
  public lookup: any = {};
  public customerID: string;
  public customerTicketForm: FormGroup;
  public integrityServiceSubscription: Subscription;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab
  public showLoading: boolean;
  public gridOptions: GridOptions = {
    columnDefs: [
      { headerName: 'T.Number', headerTooltip: 'Ticket Number', field: 'ticketNumber', width: 130, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Ticket Type', headerTooltip: 'Ticket Type', field: 'typeText', tooltipField: 'typeText', filter: true, width: 300, lockPosition: true, suppressMenu: true, sortable: true, sort: "asc" },
      { headerName: 'Sub Type', headerTooltip: 'Sub Type', field: 'errorTypeText', tooltipField: 'errorTypeText', filter: true, width: 300, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Status', headerTooltip: 'Status', field: 'ticketStatusText', tooltipField: 'ticketStatusText', filter: true, width: 100, lockPosition: true, suppressMenu: true, sortable: true, },
      {
        colId: 'assign',
        headerTooltip: 'Assign Ticket to this Activity',
        headerName: '', width: 100, sortable: true, lockPosition: true, suppressMenu: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: params => {
          if (this.isViewMode) {
            return `<i class="fa fa-lg fa-link text-muted" style="font-size: 13px;"></i>`;
          } else {
            return `<i class="fa fa-lg fa-link cursor-pointer" title="Assign Ticket to this Activity" data-action-type="assignTicket" style="font-size: 13px;"></i>`;
          }
        },
      },
    ],
    enableBrowserTooltips: true,
    headerHeight: 20,
    rowHeight: 20
  };

  constructor(private cdr: ChangeDetectorRef,
    private CDRService: CDRService,
    private fb: FormBuilder,
    private userService: UserService,
    public ticketActivityDetailService: TicketActivityDetailService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) { }


  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowSelection = 'single';
  }

  /**
   * @author Mansi Makwana
   * @createdDate 07/11/2019
   * @description get TicketID on cell click
   * @memberof TACustomerTicketComponent
   */
  public onRowClicked(e) {

    if (e.event.target !== undefined) {
      const data = e.data;
      const actionType = e.event.target.getAttribute('data-action-type');

      switch (actionType) {
        case 'assignTicket':
          if (this.isViewMode) {
            this.gridApi.forEachNode((node) => {
              node.setSelected(false);
            });
          } else {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'customer_ticket', topic: 'assign-ticket', data: e.data, id: this.modelData.id });
          }
          break;
        default:
          if (this.isViewMode) {
            this.gridApi.forEachNode((node) => {
              node.setSelected(false);
            });
          } else {
            this.checkChanges('CustTicSelection');
          }
          break;
      }
    }
  }


  checkChanges(type) {
    this.ticketActivityIntegrityService.sendMessage({ channel: 'ta-customer-ticket', topic: 'save', data: { type: type }, id: this.modelData.id });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 04/11/2019
   * @description get Ticket data
   * @memberof TACustomerTicketComponent
   */
  getCustomerTicketData(): void {
    this.showLoading = true;
    if (this.customerID) {
      let department = [];
      if (this.customerTicketForm.controls.sales.value && this.customerTicketForm.controls.sales.value != null) {
        department.push("Sales");
      }
      if (this.customerTicketForm.controls.setup.value && this.customerTicketForm.controls.setup.value != null) {
        department.push("Setup");
      }
      if (this.customerTicketForm.controls.support.value && this.customerTicketForm.controls.support.value != null) {
        department.push("Support");
      }
      if (this.customerTicketForm.controls.renew.value && this.customerTicketForm.controls.renew.value != null) {
        department.push("Renew");
      }
      if (this.customerTicketForm.controls.management.value && this.customerTicketForm.controls.management.value != null) {
        department.push("Management");
      }
      if (this.customerTicketForm.controls.development.value && this.customerTicketForm.controls.development.value != null) {
        department.push("Development");
      }
      let apiParams: any = {}
      apiParams.year = this.customerTicketForm.controls.taxSeason.value && this.customerTicketForm.controls.taxSeason.value !== null ? this.customerTicketForm.controls.taxSeason.value : [];
      apiParams.department = department;
      apiParams.customerId = this.customerID;
      apiParams.ticketStatus = this.customerTicketForm.controls.ticketStatus.value;
      apiParams.isTypeFieldRequire = false;
      this.ticketActivityDetailService.getCustomerTicketData(apiParams).then((response: any) => {
        this.rowData = response;
        this.showLoading = false;
        setTimeout(() => {
          if (this.cdr && !(this.cdr as ViewRef).destroyed) {
            this.cdr.detectChanges();
          }
        });
      });
    } else {
      this.showLoading = false;
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-11-2019
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof TACustomerTicketComponent
   */
  public onClearAll(clearSelectfor) {
    this.customerTicketForm.get(clearSelectfor).patchValue([]);
  }

  private reactiveValueChange() {
    if (this.customerTicketForm.value) {
      this.customerTicketForm.valueChanges.subscribe(data => {
        this.getCustomerTicketData();
        this.CDRService.callDetectChanges(this.cdr);
      });
    } else {
      this.showLoading = false;
    }
  }

  /**
   * @author Mansi Makwana
   * this function is select all Dropdown Data.
   * @memberof TACustomerTicketComponent
   */
  public onSelectAll() {
    const selected = this.lookup.yearsList.map(item => item.id);
    this.customerTicketForm.get('taxSeason').patchValue(selected);
  }

  initCustomerTicketForm() {
    this.customerTicketForm = this.fb.group({
      ticketStatus: 'open',
      taxSeason: [],
      customerId: this.customerID,
      sales: '',
      setup: '',
      support: '',
      renew: '',
      management: null,
      development: null
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 04/11/2019
   * @description set default checkbox value true according to user role
   * @memberof TACustomerTicketComponent
   */
  setValue() {
    if (this.userDetails.role == 'Support - US') {
      this.customerTicketForm.controls.setup.setValue(true);
      this.customerTicketForm.controls.support.setValue(true);
    } else if (this.userDetails.role == 'Customer Relation') {
      this.customerTicketForm.controls.setup.setValue(true);
      this.customerTicketForm.controls.support.setValue(true);
      this.customerTicketForm.controls.renew.setValue(true);
    } else if (this.userDetails.role == 'Sales - Rome' || this.userDetails.role == 'Sales - Atlanta' || this.userDetails.role == 'Sales Management') {
      this.customerTicketForm.controls.sales.setValue(true);
    } else {
      this.customerTicketForm.controls.setup.setValue(true);
      this.customerTicketForm.controls.support.setValue(true);
      this.customerTicketForm.controls.renew.setValue(true);
      this.customerTicketForm.controls.sales.setValue(true);
    }
    this.CDRService.callDetectChanges(this.cdr);
    this.reactiveValueChange();
  }


  // lifecycle hook called on component initialization
  ngOnInit() {
    this.showLoading = true;
    this.ticketActivityIntegrityService.getMessage().subscribe(data => {
      if (data.topic === 'isViewMode') {
        this.isViewMode = data.data;
      }
    });
    this.initCustomerTicketForm();
    this.userDetails = this.userService.getUserDetail();
    this.setValue();
    this.integrityServiceSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(messageObj => {

      if (messageObj.topic == 'lookup') {
        this.lookup = messageObj.data;
      }

      if (this.modelData && messageObj.id == this.modelData.id) {
        if (messageObj.topic === 'activityId') {
          this.currentActivityId = messageObj.data;
        }
        if (messageObj.topic == 'customerID') {
          this.customerID = messageObj.data;
          this.getCustomerTicketData();
        }

        if (messageObj.topic == 'CustTicChangeSelection') {
          let selectedRows = this.gridApi.getSelectedRows();
          let selectedId = selectedRows[0].id;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'customer_ticket', topic: 'ticket', data: selectedId, id: this.modelData.id });
        }
      }
      else if (!this.currentActivityId) {
        /**  
         * description : when open dialog for new activity that time currentActivityId is undefined and cond won't fullfil to get customerdetail   
         */
        if (messageObj.topic === 'customerID') {
          this.customerID = messageObj.data;
          this.getCustomerTicketData();
        }
      }
    })
  }

  ngOnDestroy() {
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }

  }

}
