// External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange, OnDestroy, Input, ViewRef } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

// Internal imports
import { CDRService, UserService, DialerService } from '@app/shared/services'
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';

@Component({
  selector: 'mtpo-ta-customer-activity',
  templateUrl: './ta-customer-activity.component.html',
  styleUrls: ['./ta-customer-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TACustomerActivityComponent implements OnInit, OnDestroy {
  // @Input('urlID') urlID: string;
  // @Input('customerID') customerID: string;  // Todo : pass customerID as request data in getCustomerOpenActivities for fetching all activities related to the particular customer
  // @Input('activityData') activityData: any = {};  // object containing the complete data of the current selected activity
  // @Input('lookup') lookup: any = {};  // object containing different lookup values

  // public variable
  @Input() modelData: any;
  @Input('activityId') currentActivityId;
  public totalOpenActivities: number = 0;  // count of total activites of the customer having an open status
  public arrayOfActivityIds: Array<any> = [];  // array list containing all activity ID's of the customer having an open status
  public currentActivityIndex: number;  // index number of the current selected activity out of the array list of activities of customer having an open status

  //grid related variables
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowSelection;
  public rowData = [this.domLayout = 'autoHeight'];
  public rowClassRules: any;
  public showLoading: boolean;
  public customerID;
  public activityData: any = {};
  public getRowStyle: any;
  public lookup;
  public customerActivityData: Subscription;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab
  public userDetails: any;

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Type',
        headerTooltip: 'Type',
        field: 'type',
        width: 250,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        tooltipValueGetter: params => {
          return params.data.subject
        },
        cellStyle: { cursor: "pointer" },
        cellRenderer: params => {
          if (params.data) {
            return params.data.type + '-' + params.data.direction
          }
        },
      },
      {
        headerName: 'Responsible Person',
        headerTooltip: 'Responsible Person',
        field: 'responsiblePerson',
        filter: true,
        width: 250,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        comparator: (valueA, valueB) => {
          return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
      },
      {
        headerName: 'Status',
        headerTooltip: 'Status',
        field: 'status',
        tooltipField: 'status',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true
      },
      {
        headerName: 'Actual / Planned',
        headerTooltip: 'Actual/Planned',
        field: 'datetime',
        filter: true,
        width: 200,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        sort: "desc",
        cellRenderer: params => {
          if (params.data.plannedDateTime) {
            return `<span>${params.data.datetime}</span> <br> ` +
              ` <span>${params.data.plannedDateTime} </span>`
          } else {
            return `<span>${params.data.datetime}</span> `
          }
        }
      },
    ],
    enableBrowserTooltips: true,
    getRowStyle: function (params) {
      if (params.data.priority == 'Immediate') {
        return { 'background-color': '#fcafaf' }
      } else if (params.data.priority == 'High') {
        return { 'background-color': '#fbfcaf' }
      } else if (params.data.isCurrentRefundRequest == true) {
        return { 'background-color': '#ADD8E6' }
      } else if (params.data.isRefundRequestDenied == true) {
        return { 'background-color': '#6ba8bc' }
      }
      return null;
    },
    headerHeight: 20,
    rowHeight: 40
  };


  constructor(
    private cdr: ChangeDetectorRef,
    private ticketActivityDetailService: TicketActivityDetailService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService, private cdrService: CDRService, private userService: UserService, public dialerService: DialerService) {
    this.rowClassRules = {
      "highlightSelectedActivity": (params) => {
        if (params.data.id === this.currentActivityId) {
          this.currentActivityIndex = this.rowData.findIndex((obj: any) => obj.id === params.data.id);
          this.cdrService.callDetectChanges(this.cdr);
          return params.data.id;
        }
      }
    }
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 12/11/2019
   * @description grid ready
   * @memberof TACustomerActivityComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowSelection = 'single';
  }

  checkChanges(type) {
    this.ticketActivityIntegrityService.sendMessage({ channel: 'ta-customer-activity', topic: 'save', data: { type: type }, id: this.modelData.id });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 12/11/2019
   * @description to handle the process of viewing the previous, next or the selected activity
   * @memberof TACustomerActivityComponent
   */
  prevNext(action: string) {
    let newActivityId;
    if (action === 'CustActSelection') {
      if (this.isViewMode) {
        this.gridApi.forEachNode((node) => {
          node.setSelected(false);
        });
      } else {
        let selectedRows = this.gridApi.getSelectedRows();
        newActivityId = selectedRows[0].id;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'customer_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
      }
    }
    if (action === 'CustActNext') {
      newActivityId = this.arrayOfActivityIds[this.currentActivityIndex + 1];
      this.ticketActivityIntegrityService.sendMessage({ channel: 'customer_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
    } else if (action === 'CustActPrev') {
      newActivityId = this.arrayOfActivityIds[this.currentActivityIndex - 1];
      this.ticketActivityIntegrityService.sendMessage({ channel: 'customer_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
    }
  }


  /**
     * @author Satyam Jasoliya
     * @createdDate 12/11/2019
     * @description to get all activities related to a particular customer with open status
     * @memberof TACustomerActivityComponent
     */
  getCustomerOpenActivities() {
    if (this.customerID) {
      this.showLoading = true;
      this.cdrService.callDetectChanges(this.cdr);
      this.ticketActivityDetailService.getCustomerOpenActivities(this.customerID).then((response: any) => {
        if (response) {
          response = _.orderBy(response, ['datetime'], ['desc']);
          this.arrayOfActivityIds = (response && response.length > 0) ? response.map(t => t.id) : [];
          if (this.activityData && this.activityData.id) {
            this.currentActivityIndex = this.arrayOfActivityIds.findIndex(obj => obj === this.activityData.id);
          }
          this.showLoading = false;
          this.rowData = response;
          this.totalOpenActivities = response.length > 0 ? response[0].total : 0;
          this.cdrService.callDetectChanges(this.cdr)
        }
      });
    } else {
      this.showLoading = false;
      this.cdrService.callDetectChanges(this.cdr);
    }
  }

  // lifecycle hook called on component initialization
  ngOnInit() {
    this.showLoading = true;
    this.userDetails = this.userService.getUserDetail();
    this.customerActivityData = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {

      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        if (this.customerID && this.lookup.activityStatusList && this.lookup.activityStatusList.length > 0) {
          this.getCustomerOpenActivities();
        }
      }

      if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityId') {
          this.currentActivityId = msgObj.data;
          if (this.gridApi) {
            this.gridApi.redrawRows();
          }
        }
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
        }
        if (msgObj.topic === 'customerID') {
          this.customerID = msgObj.data;
          if (this.lookup && this.lookup.activityStatusList && this.lookup.activityStatusList.length > 0) {
            this.getCustomerOpenActivities();
          }
        }
        // && this.currentActivityId && this.currentActivityId === data.id  --> remove this cond coz when we open dialog for new mode that time we dont have currentActivityId
        if (msgObj.topic === 'isViewMode') {
          this.isViewMode = msgObj.data;
        }
        if (msgObj.topic === 'CustActChangeSelection') {
          this.prevNext(msgObj.data);
        }
      }
      // else if (!this.currentActivityId) {
      //   if (msgObj.topic === 'activityId') {
      //     this.currentActivityId = msgObj.data;
      //   }

      // }

    });
  }

  // lifecycle hook called on any input change
  ngOnChanges(changes: SimpleChange) {

  }

  ngOnDestroy() {
    if (this.customerActivityData) {
      this.customerActivityData.unsubscribe();
    }
  }

}
