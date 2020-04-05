// External Imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, OnDestroy, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import * as _ from 'lodash'

// Internal Imports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { CommonApiService } from "@app/shared/services";
import { APINAME } from '@app/ticket-activity/ticket-activity.constants';


@Component({
  selector: 'mtpo-ta-ticket-activity',
  templateUrl: './ta-ticket-activity.component.html',
  styleUrls: ['./ta-ticket-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class TATicketActivityComponent implements OnInit, OnDestroy {

  @Input() modelData: any;
  @Input('activityId') currentActivityId;
  // public variable
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowSelection;
  public isViewMode: boolean;  // for handling view or edit mode when activity open in new tab
  public showLoading: boolean;
  public activityId: any;
  public getRowStyle: any;
  public rowClassRules: any;
  public rowData: any = [this.domLayout = 'autoHeight'];
  public previousActivity: any;
  public arrOfActivityId: any = [];
  public currentActivityIndex: number;  // index number of the current selected activity out of the array list of activities of customer having an open status
  public ticketList: Array<any> = [];
  public integrityServiceSubscription: Subscription;
  public activityEditorSection;
  public kendoChatHeight;
  public gridOptions: GridOptions = {
    columnDefs: [
      { headerName: 'Type', headerTooltip: 'Type', field: 'type', 
      cellRenderer: params => {
        if (params.data) {
          return params.data.type + '-' + params.data.direction
        }
      },
      width: 150, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Subject', headerTooltip: 'Subject', field: 'subject', tooltipField: 'subject', filter: true, width: 550, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Responsible', headerTooltip: 'Responsible', field: 'responsiblePerson', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Status', headerTooltip: 'Status', field: 'status', tooltipField: 'status', filter: true, width: 100, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Actual Datetime', headerTooltip: 'Actual Datetime', field: 'datetime', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true, sort: "desc" },
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
    rowHeight: 20
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private ticketActivityDetailService: TicketActivityDetailService, private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private commonApiService: CommonApiService,
  ) {
    this.rowClassRules = {
      "highlightSelectedActivity": (params) => {
        if (this.activityId) {
          if (params.data.id === this.activityId) {
            this.currentActivityIndex = this.rowData.findIndex((obj: any) => obj.id === params.data.id);
            this.cdr.detectChanges();
            return true;
          }
        }

      }
    }
  }


  /**
     * @author Satyam Jasoliya
     * @createdDate 12/11/2019
     * @description grid ready
     * @memberof TATicketActivityComponent
     */
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowSelection = 'single';
  }

  /**
      * @author Satyam Jasoliya
      * @createdDate 12/11/2019
      * @description get ticket details
      * @updatedBy Dhruvi Shah
      * @updatedDate 20/12/2019
      * @description previously this fun call api from service which will emit other events and multiple api called so now getTicketDetails api call from here
      * @memberof TATicketActivityComponent
      */
  getTicketDetails(id: string) {
    if (id) {
      this.showLoading = true;
      let isExists = this.ticketList.findIndex(t => t.id == id)
      if (isExists > -1) {
        if (this.ticketList[isExists] && this.ticketList[isExists].activityId && this.ticketList[isExists].activityId.length > 0 && (!this.ticketList[isExists].activityDetails || this.ticketList[isExists].activityDetails.length == 0)) {
          this.getTicketDetailsById(id);
        } else {
          if (this.ticketList[isExists] && this.ticketList[isExists].activityDetails) {
            this.showLoading = false;
            this.ticketList[isExists].activityDetails = _.orderBy(this.ticketList[isExists].activityDetails, ['datetime'], ['desc']);
            this.rowData = this.ticketList[isExists].activityDetails;
            this.ticketActivityIntegrityService.sendMessage({ channel: 'ta-ticket-activity-length', topic: 'ta-ticket-activity-length', data: this.rowData.length, id: this.modelData.id });
            this.previousActivity = this.rowData;
            setTimeout(()=>{
              const activityHeight = document.getElementById('activtiyHeight').offsetHeight;
              this.activityEditorSection = 846 - activityHeight;
              this.kendoChatHeight = this.activityEditorSection - 166;
              this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: this.activityEditorSection, id: this.modelData.id });
              this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: this.kendoChatHeight, id: this.modelData.id });  
            },500);
          } else {
            this.rowData = [];
            this.showLoading = false;
          }
        }
        this.arrOfActivityId = [];
        for (let obj of this.rowData) {
          this.arrOfActivityId.push({ 'id': obj.id });
        }
        this.currentActivityIndex = this.rowData.findIndex(obj => obj.id === this.activityId);
        this.cdr.detectChanges();
      }
    } else {
      this.currentActivityIndex = undefined
      this.rowData = [];
      this.showLoading = false;
    }
  }


  getTicketDetailsById(id: string) {
    if (id) {
      this.showLoading = true;
      let isExists = this.ticketList.findIndex(t => t.id == id)
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKET_BY_ID_NEW, parameterObject: { 'ticketId': id } }).then(response => {
        if (response && response.activityDetails && response.activityDetails.length > 0) {
          this.ticketList[isExists].activityDetails = response.activityDetails
          this.showLoading = false;
          response.activityDetails = _.orderBy(response.activityDetails, ['datetime'], ['desc']);
          this.rowData = response.activityDetails;
          this.ticketActivityIntegrityService.sendMessage({ channel: 'ta-ticket-activity-length', topic: 'ta-ticket-activity-length', data: this.rowData.length, id: this.modelData.id });
          this.previousActivity = this.rowData;
          setTimeout(()=>{
            const activityHeight = document.getElementById('activtiyHeight').offsetHeight;
            this.activityEditorSection = 846 - activityHeight;
            this.kendoChatHeight = this.activityEditorSection - 166;
            this.ticketActivityIntegrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data: this.activityEditorSection, id: this.modelData.id });
            this.ticketActivityIntegrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: this.kendoChatHeight, id: this.modelData.id });  
          },500);
        } else {
          this.rowData = [];
          this.showLoading = false;
        }
        this.arrOfActivityId = [];
        for (let obj of this.rowData) {
          this.arrOfActivityId.push({ 'id': obj.id });
        }
        this.currentActivityIndex = this.rowData.findIndex(obj => obj.id === this.activityId);
        this.cdr.detectChanges();
      });
    }
    else {
      this.currentActivityIndex = undefined
      this.rowData = [];
      this.showLoading = false;
    }
  }


  setTicketData(data) {
    if (data) {
      this.rowData = data;
      this.previousActivity = this.rowData;
    } else {
      this.rowData = [];
      this.showLoading = false;
    }

    this.arrOfActivityId = [];
    for (let obj of this.rowData) {
      this.arrOfActivityId.push({ 'id': obj.id });
    }
    this.currentActivityIndex = this.rowData.findIndex(obj => obj.id === this.activityId);
    this.cdr.detectChanges();
  }


  checkChanges(type) {
    this.ticketActivityIntegrityService.sendMessage({ channel: 'ta-ticket-activity', topic: 'save', data: { type: type }, id: this.modelData.id });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 12/11/2019
   * @discription to handle the process of viewing the previous, next or the selected activity
   * @memberof TATicketActivityComponent
   */
  prevNext(action: string) {
    let newActivityId;
    if (action === 'TicActSelection') {
      if (this.isViewMode) {
        this.gridApi.forEachNode((node) => {
          node.setSelected(false);
        });
      } else {
        let selectedRows = this.gridApi.getSelectedRows();
        newActivityId = selectedRows[0].id;
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
      }
    }
    if (action === 'TicActNext') {
      newActivityId = this.rowData[this.currentActivityIndex + 1].id;
      this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
    } else if (action === 'TicActPrev') {
      newActivityId = this.rowData[this.currentActivityIndex - 1].id;
      this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket_activity', topic: 'activity', data: newActivityId, id: this.modelData.id });
    }
  }

  /** Lifecycle hook called on first time initialization of the component */
  ngOnInit() {
    // this.showLoading = true;
    this.integrityServiceSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(messageObj => {
      if (this.modelData && messageObj.id == this.modelData.id) {

        if (messageObj.topic === 'activityId') {
          this.activityId = messageObj.data;
          this.currentActivityId = messageObj.data;
          if (this.gridApi) {
            this.gridApi.redrawRows();
          }
        }
        if (messageObj.topic === 'ticketList') {
          if (messageObj.data && messageObj.data.length > 0) {
            this.ticketList = messageObj.data;
            this.cdr.detectChanges();
          } else {
            this.ticketList = [];
          }
        }
        if (messageObj.topic === 'ticketID') { // && this.currentActivityId && this.currentActivityId === messageObj.id
          this.getTicketDetails(messageObj.data);
          this.cdr.detectChanges();
        }
        if (messageObj.topic === 'isViewMode') {
          this.isViewMode = messageObj.data;
          this.cdr.detectChanges();
        }
        if (messageObj.topic === 'TicActChangeSelection') {
          this.prevNext(messageObj.data);
        }
      }
      else {
        this.showLoading = false;
      }
      //  else if (!this.currentActivityId) {
      //   if (messageObj.topic === 'activityId') {
      //     this.activityId = messageObj.data;
      //     this.currentActivityId = messageObj.data;
      //   }
      // }
      
    });
  }

  /** Lifecycle hook called when component is destroyed */
  ngOnDestroy() {
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }
}
