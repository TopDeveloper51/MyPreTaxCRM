// External imports
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment-timezone'
import * as _ from 'lodash';

// Internal imports
import { UserService, MessageService, CDRService, DialogService } from '@app/shared/services'
import { HourMinuteSecondPipe } from '@app/shared/pipe/common.pipe';
import { TimeAccountingService } from '@app/time-accounting/time-accounting.service';
import { CheckinoutHistoryComponent } from '@app/shared/dialogue/checkinout-history/checkinout-history.component';
import { CheckinoutManualComponent } from '@app/shared/dialogue/checkinout-manual/checkinout-manual.component';
import { BreakDetailComponent } from '@app/time-accounting/dialogs/break-detail/break-detail.component';
import { ReopenedHistoryComponent } from '@app/time-accounting/dialogs/reopened-history/reopened-history.component';

@Component({
  selector: 'app-time-accounting-details',
  templateUrl: './time-accounting-details.component.html',
  styleUrls: ['./time-accounting-details.component.scss'],
  providers: [TimeAccountingService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAccountingDetailsComponent implements OnInit {

  @Input('searchData') searchData: any;
  @Input('mode') isManagerMode: any;
  @Input() lookup: any = {};
  @Output() getCheckInStatus = new EventEmitter();
  @Input() isFromReminder: boolean = false;
  @Input() dataForPendingRequests: any = {};
  @Input() dataForPendingApprovals: any = {};
  @Input() filterForGraph: any = [];
  @Output() isGraphLoaded = new EventEmitter();
  @Output() updateReminderData = new EventEmitter();
  public CheckInOutUserGridData: any;
  public domLayout;
  public checkInData: any = [this.domLayout = 'autoHeight'];
  public rowDragManaged: any;
  public columnDefs: any;
  public sideBar: any;
  public multiSortKey: string;
  public animateRows: string;
  public floatingFilter: string;
  public enableCharts: string;
  public enableRangeSelection: string;
  public rowModelType;
  public rowSelection: string;
  public originalData: any;
  public isTopManagementUser: boolean = false
  public isTimeAccountingManager: boolean = false
  public gridApi;
  public gridColumnApi;
  public defaultColDef: any;
  public getRowStyle; // get row style
  public rowClassRules: any;
  public averageCouters: any = { 'totalTimePresent': 0, 'totalBreakTime': 0, 'totalCallTime': 0 };

  public initCalled: boolean = false;
  public disableSearch: boolean = false; // to disable search button
  public historySearch: any = { 'userId': [] }; // to pass in api
  public responsiblePersonList: any = []; // store responsible person list from lookup
  public availableHistory: any = []; // store response of getCheckInStatus
  public departments: any = []; // to store department data
  public maxDate: Date; // used in date picker
  public isShowGraph: boolean = false; // show graph flag
  public disableNext: boolean = false;
  public showInfo: any;
  public bandArr: any[] = [{ id: 3, name: '3' }, { id: 4, name: '4' }, { id: 5, name: '5' }];
  public breakDetails: any = [];
  public minBreakPeriod: any;
  public actualResponsiblePersonList = [];
  public userDetail: any; // store user's detail
  public isManagement: boolean = false; // check for management user
  public name: string;
  public userName: string;
  public previousDate: any = null;
  public isShowDraw: boolean = false; // show graph flag
  public optionsArray: any = [];
  public optionsArrayData: any = [];
  public approvalBreakDetails: any = [];
  public overallBreakDetails: any = [];
  public getRowHeight: any
  public options: any = {
    data: [],
    chart: {
      chartType: 'stackedColumn',
      dataListField: 'timingData',
      YpropertyName: "UNAME",
      XpropertyName: "ST",
      chartProperty: [
        {
          barColor: '#0000FF', //  color field like 'red' or '#ff0000'
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'phoneOut'
          }//  for x axis
        },
        // for checkin 
        {
          Image: 'assets/images/up.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckIn'
          }//  for x axis
        },
        // for checkin 
        // for check in due to break by same user 
        {
          Image: 'assets/images/blueup.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckInDuetoBreakByUser'
          }//  for x axis
        },
        // for check in due to break by same user 
        // for check in due to break by other user
        {
          Image: 'assets/images/redup.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckInDuetoBreakByOther'
          }//  for x axis
        },
        // for check in due to break by other user 
        // for checkout 
        {
          Image: 'assets/images/down.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckOut'
          }//  for x axis
        },
        // for checkout 
        // for check out due to break by same user 
        {
          Image: 'assets/images/bluedown.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckOutDuetoBreakByUser'
          }//  for x axis
        },
        // for check out due to break by same user 
        // for check out due to break by other user
        {
          Image: 'assets/images/reddown.png',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'CheckOutDuetoBreakByOther'
          }//  for x axis
        },
        // for check out due to break by other user
        {
          barColor: '#fef983', // color field like 'red' or '#ff0000'
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'phoneIn'
          } // for x axis
        },
        {
          barColor: '#006400', // color field like 'red' or '#ff0000'
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'pdSession'
          } // for x axis
        },
        // {
        //     barColor: '#FF4500', // color field like 'red' or '#ff0000'
        //     subJson: {
        //         startValueField: 'ST',
        //         endValueField: 'ET',
        //         dataCompareFiled: 'TYP',
        //         dataCompareValue: 'empty'
        //     }// for x axis
        // },
        {
          barColor: '#A9A9A9', // color field like 'red' or '#ff0000'
          barHeight: 20,
          yCurrentLocation: -4,
          barLabelColor: '#000',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'break',
            barLabel: 'SEC'
          }// for x axis
        },
        {
          barColor: '#D3D3D3', // color field like 'red' or '#ff0000'
          barHeight: 20,
          isShowpattern: true,
          yCurrentLocation: -5,
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'grace',
          }// for x axis
        },
        {
          barColor: "#ffc247",
          subJson: {
            startValueField: "ST",
            endValueField: "ET",
            dataCompareFiled: "TYP",
            dataCompareValue: "meeting"
          }
        },
        {
          barColor: "#FF5733",
          subJson: {
            startValueField: "ST",
            endValueField: "ET",
            dataCompareFiled: "TYP",
            dataCompareValue: "chat",
            isIntensity: true,
            intensityDataLabel: "chatData",
            intensityConfiguration: {
              startValueField: "ST",
              endValueField: "ET",
              dataCompareFiled: "INT"
            }
          }
        }
      ],
      showVerticalGrid: false,
      isShowLabels: false,
      isBand: true,
      groupBy: "TYP",
      bandCount: 3,
      bandSupported: ["chat"],
      priority: ["break", "meeting", "chat", "phoneOut", "pdSession", "phoneIn", "icons", "CheckIn", "CheckOut", "CheckInDuetoBreakByUser", "CheckInDuetoBreakByOther", "CheckOutDuetoBreakByUser", "CheckOutDuetoBreakByOther"]
    },
    MinRange: null,
    MaxRange: null,
    yAxisType: 'string',
    xAxisType: 'time',
    xMinRange: '00:00',
    xMaxRange: '24:00',
    xGap: {
      hour: 1,
    },
    labelOnXAxis: true,
    cluture: 'en-US',
    canvasHeight: 600,
    lineColor: '#D3D3D3',
    Color: '#000',
    MinIndicators: "assets/images/previous.png",
    MaxIndicators: "assets/images/next.png",
  };

  constructor(private timeAccountingSrvice: TimeAccountingService,
    private dialogService: DialogService,
    private userService: UserService,
    private messageService: MessageService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef, ) {
    this.userDetail = this.userService.getUserDetail();
    this.isTopManagementUser = this.userDetail.isTopManagementUser;
    this.isTimeAccountingManager = this.userDetail.isTimeAccountingManager;
    this.columnDefs = [
      {
        headerName: '',
        field: '',
        width: 50,
        headerTooltip: '',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.isDateDifferent) {
              return '<img src="assets/images/warningOfDate.png" height="20px;" width="20px;" />';
            }
            if (params.data.overlappedReason) {
              return '<img src="assets/images/warningOfDate.png" height="20px;" width="20px;" />';
            }
            if (params.data.overlappedInReason) {
              return '<img src="assets/images/warningOfDate.png" height="20px;" width="20px;" />';
            }
          }
        },
      },

      {
        headerName: 'IP Address',
        field: 'ipAddress',
        width: 280,
        headerTooltip: 'IP Address',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Date',
        field: 'date',
        width: 150,
        headerTooltip: 'Date',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Check In',
        field: 'checkInTime',
        width: 150,
        headerTooltip: 'Check In',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        // cellRenderer: (data) => {
        //   return moment(data.checkIn).tz('America/New_York').format('hh:mm A')
        // }
        sort: 'asc',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Check Out',
        field: 'checkOutTime',
        width: 150,
        headerTooltip: 'Check Out',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Duration',
        field: 'duration',
        width: 100,
        headerTooltip: 'Duration',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        // cellClass:'textRight',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black',
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black',
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black',
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black',
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important',
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Created By',
        field: 'createdByName',
        width: 190,
        headerTooltip: 'Created By',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Updated By',
        field: 'updatedByName',
        width: 190,
        headerTooltip: 'Updated By',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.data.isDeleted) {
            return {
              'text-decoration': 'line-through !important',
              'cursor': 'not-allowed',
              'opacity': '0.7',
              'color': 'black'
            };
          }
          if (params.data.status === 'approved' && params.data.isDeleted) {
            return {
              'background-color': '#cee8ca !important',
              'text-decoration': 'line-through !important',
              cursor: 'not-allowed',
              opacity: '0.7',
              color: 'black'
            };
          } else if (params.data.status == 'approved' && (this.isTopManagementUser == true || this.isTimeAccountingManager)) {
            return {
              'background-color': '#cee8ca !important',
              opacity: '0.7',
              color: 'black'
            }
          } else if (params.data.status == 'sentForApproval' && params.data.isDeleted) {
            return {
              'background-color': '#fdf9ab !important',
              cursor: 'not-allowed',
              'text-decoration': 'line-through !important',
              color: 'black'
            };
          }
          else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && params.data.isDeleted) {
            return {
              'cursor': 'not-allowed',
              'text-decoration': 'line-through !important'
            };
          }
          else {
            return '';
          }
        }
      },
      {
        headerName: 'Comment',
        field: '',
        width: 150,
        headerTooltip: 'Comment',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellClass: 'textCenter',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.comment !== undefined && params.data.comment !== '') {
              return ' <i class="far fa-comment-dots fa-lg" aria-hidden="true"></i>';
            }

          }
        },
      },
      {
        headerName: 'Manual Entry',
        field: '',
        width: 130,
        headerTooltip: 'Manual Entry',
        headerClass: 'textCenter',
        cellClass: 'textCenter',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.isManualEntry) {
              return '<img src="assets/images/Approved.png" height="20px;" width="20px;" />';
            }
          }
        },
      },

      {
        headerName: '',
        field: '',
        width: 60,
        headerTooltip: '',
        // rowDrag: true,
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.history !== undefined && params.data.history.length > 0) {
              return '<img src="assets/images/history_32.png" height="20px;" width="20px;" data-action-type="history" />';
            }
          }
        },
        cellClass: 'textCenter',
      },
      {
        headerName: '',
        field: '',
        width: 60,
        headerTooltip: '',
        cellRenderer: (params) => {
          if (params.data) {
            if (this.isManagerMode) {
              for (let objAvailableHistory of this.availableHistory) {
                for (let dIndex in this.availableHistory.departmentData) {
                  for (const accDetails of objAvailableHistory.departmentData[dIndex].accountingDetails) {
                    if (accDetails.checkInCheckOutDetails) {
                      for (let cIndex in accDetails.checkInCheckOutDetails) {
                        if (objAvailableHistory.departmentData[dIndex].isAbleToApprove === true &&
                          accDetails.checkInCheckOutDetails[cIndex].status === 'sentForApproval' &&
                          accDetails.checkInCheckOutDetails[cIndex].isDeleted === undefined ||
                          (this.isTopManagementUser || (this.isTimeAccountingManager && this.isManagerMode) &&
                            accDetails.checkInCheckOutDetails[cIndex].status === 'approved' && accDetails.checkInCheckOutDetails[cIndex].isDeleted === undefined) || (this.userDetail.id == this.searchData.userId[0] && (accDetails.checkInCheckOutDetails[cIndex].status == undefined || accDetails.checkInCheckOutDetails[cIndex].status == 'pending') && accDetails.checkInCheckOutDetails[cIndex].isDeleted == undefined)) {
                          return ' <i class="far fa-trash-alt" data-action-type="deleteRecord"></i>';
                        }
                      }

                    }
                  }
                }
              }
            } else {
              return ' <i class="far fa-trash-alt" data-action-type="deleteRecord"></i>';
            }


          }
        },
        cellClass: 'textCenter',

      },
    ],
      this.sideBar = {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
          },
          {
            id: "filters",
            labelDefault: "Filters",
            labelKey: "filters",
            iconKey: "filter",
            toolPanel: "agFiltersToolPanel"
          },
        ]
      };
    this.getRowStyle = (params) => {
      if (params.data.status !== undefined && params.data.status === 'approved') {
        return {
          'background-color': '#cee8ca !important',
          'cursor': 'not-allowed',
          'opacity': '0.7',
          'color': 'black'
        };
      }
      if (params.data.status == 'sentForApproval' && params.data.isAbleToApprove == true) {
        return {
          'background-color': '#fdf9ab !important',
          color: 'black',
        };
      } else if (params.data.status == 'sentForApproval' && params.data.isAbleToApprove == false) {
        return {
          'background-color': '#fdf9ab !important',
          cursor: 'not-allowed',
          color: 'black'
        };
      }
      else if ((this.userDetail.id != params.data.userId) && params.data.status == 'pending' && this.isTopManagementUser == false && this.isTimeAccountingManager == false) {
        return { 'cursor': 'not-allowed !important' };
      }
      else {
        return '';
      }
    };

    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      tooltipValueGetter: (p: any) => {
        return p.value;
      },
      resizable: true,
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true
    };
    this.domLayout = "autoHeight";
    this.multiSortKey = 'ctrl';
    this.rowDragManaged = 'true';
    this.animateRows = 'true';
    this.floatingFilter = 'true';
  }


  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall called when page is load to bind data in gird
   * @memberOf TimeAccountingVewComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall This function is used to open checkIn/Out history dialog
   * @memberOf TimeAccountingVewComponent
   */
  public getCheckInORCheckOutHistory(history: any): void {
    // open dialog
    this.dialogService.custom(CheckinoutHistoryComponent, { 'data': { 'history': history }, 'disableRemove': true }, { keyboard: true, backdrop: 'static', size: 'xl' })
      .result.then((result) => {
      }, function (btn: any): void {
      });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall This function is used to open edit dialog when user click on record
   * @memberOf TimeAccountingVewComponent
   */
  public editEntry(selectedRow): void {
    let currentIndex = this.originalData.findIndex(o => o.checkInId === selectedRow.data.checkInId);
    if (((this.isTopManagementUser == true || this.isTimeAccountingManager) && selectedRow.data.isDeleted == undefined) || ((this.userDetail.id == selectedRow.data.userId) && (selectedRow.data.status == undefined || selectedRow.data.status == 'pending') && selectedRow.data.isDeleted == undefined) || (selectedRow.data.isAbleToApprove == true && selectedRow.data.status == 'sentForApproval' && selectedRow.data.isDeleted == undefined) || ((this.userDetail.isTopManagementUser || this.userDetail.isTimeAccountingManager) && selectedRow.data.status == 'approved' && selectedRow.data.isDeleted == undefined)) {
      const self = this;
      this.dialogService.custom(CheckinoutManualComponent, { 'data': { 'mode': 'edit', 'manualEntry': this.originalData[currentIndex], 'date': this.originalData[currentIndex].date }, 'disableRemove': true }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
        if (result) {
          self.getCheckInStatus.emit(true);
        }
      },
        (error) => { console.error(error); }
      );
    }
  }

  /**
   * @author shreya kanani
   * @param data 
   * @description this method called when ag grid row clicked
   */
  public onRowClicked(data) {
    if (data.event.target !== undefined) {
      const actionType = data.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "history":
          this.getCheckInORCheckOutHistory(data.data.history);
          break;
        case "deleteRecord":
          this.deleteRecord(data.data);
          break;
        default:
          this.editEntry(data);
          break;
      }
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall call to delete user's record
   * @memberOf TimeAccountingVewComponent
   */
  public deleteRecord(data): any {
    const self = this;
    if (((this.isTopManagementUser == true || this.isTimeAccountingManager) && data.isDeleted == undefined) || (this.userDetail.id == data.userId && (data.status == undefined || data.status == 'pending') && data.isDeleted == undefined) || (data.isAbleToApprove == true && data.status == 'sentForApproval' && data.isDeleted == undefined) || ((this.userDetail.isTopManagementUser || this.userDetail.isTimeAccountingManager) && data.status == 'approved' && data.isDeleted == undefined)) {
      // Open dialog for conformation before deleting contact data
      const dialogData = { title: 'Confirmation', text: `Are you sure, you want to delete this record ?` };
      this.dialogService.confirm(dialogData, {}).result.then((result) => {
        if (result === 'YES') {
          let json = {
            'docId': data.docId,
            'date': data.date,
            'id': data.checkInId
          }
          this.timeAccountingSrvice.deleteCheckInOutDetail(json).then((response) => {
            if (response) {
              this.messageService.showMessage('Record deleted successfully', 'success');
              self.getCheckInStatus.emit(true);
            }
          }, (error) => {
            console.log(error);
          });
        }
      },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall called when user clicks on 'Request for Approval' or 'Approve' button
   * @memberOf TimeAccountingVewComponent
   */
  public approval(data, status, userName?) {
    let isAllowed = true;
    if (status === 'sentForApproval') {
      let checkInOutData = data.checkInCheckOutDetails.filter(o => !o.isDeleted);
      for (let obj of checkInOutData) {
        if (obj.checkOut && status === 'sentForApproval') {
          isAllowed = true;
        } else {
          isAllowed = false;
          break;
        }
      }
    }

    if (isAllowed) {
      if (data.breakDetailsLeft && data.breakDetailsLeft.length > 0) {
        this.dialogService.custom(BreakDetailComponent, { lookup: this.lookup, breakDetails: data.breakDetailsLeft, userName: userName, date: data.date, minBreakPeriod: this.minBreakPeriod, status: status }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
          (result: any) => {
            if (result != undefined) {
              let breakDetails = result.breakDetails;
              let reopenedReason = result.reopenedReason;
              this.confirmDialog(data, status, reopenedReason, breakDetails);
            }
          }, (error) => {
            console.log(error);
          }
        );
      } else {
        this.confirmDialog(data, status, undefined);
      }
    } else {
      this.messageService.showMessage("Please 'Check-Out' first", 'error');
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall to open confirm dialog
   * @memberOf CheckinoutHistoryUserComponent
   */
  public confirmDialog(data, status, reopenedReason, breakDetails?) {
    let confirmMsg: any = '';
    if (status == 'sentForApproval') {
      confirmMsg = { title: 'Confirmation', text: `Are you sure, you want to send request for approval?` };
    } else if (status == 'approved') {
      confirmMsg = { title: 'Confirmation', text: `Are you sure, you want to approve these records ?` };
    } else if (status == 'reopened') {
      confirmMsg = { title: 'Confirmation', text: `Are you sure, you want to reopen the request ?` };
    }
    this.dialogService.confirm(confirmMsg, {}).result.then((result) => {
      if (result === 'YES') {
        let json = {
          'date': data.date,
          'docId': data.checkInCheckOutDetails[0].docId,
          'status': status,
          'reopenedReason': reopenedReason,
          'breakDetails': breakDetails ? breakDetails : []
        }
        // call api to approve records
        this.timeAccountingSrvice.verifyCheckInOutRecords(json).then((response) => {
          if (this.isFromReminder) {
            this.updateReminderData.emit();
          } else {
            this.getCheckInStatus.emit();
          }

          let msg = ''
          if (status == 'sentForApproval') {
            msg = 'Records sent for approval successfully';
          } else if (status == 'approved') {
            msg = 'Records approved successfully';
          } else if (status == 'reopened') {
            msg = 'Request reopened successfully';
          }
          this.messageService.showMessage(msg, 'success');
        })

      }
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 16/03/2020
   * @discriptioncall Method for transforming the seconds to hours, minutes and seconds
   * @memberOf CheckinoutHistoryUserComponent
   */
  public convertSecondsToHours(totalSeconds: any, ishhmm: boolean) {
    if (totalSeconds != undefined) {
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
      // round seconds
      seconds = Math.round(seconds * 100) / 100
      if (isNaN(hours)) {
        return totalSeconds;
      }
      if (ishhmm !== undefined && ishhmm == true) {
        // var result = (hours < 10 ? "0" + hours : hours);
        let result: any = hours;
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        return result
      } else {
        // var result = (hours < 10 ? "0" + hours : hours);
        let result: any = hours;
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds < 10 ? "0" + seconds : seconds);
        return result
      }
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall to set available history
   * @memberOf CheckinoutHistoryUserComponent
   */
  public setAvailableHistory(response) {
    if (response !== undefined) {
      this.availableHistory = [];
      this.departments = [];

      if (Object.keys(response).length > 0) {
        this.departments = Object.keys(response);
        for (const obj of this.departments) {
          this.availableHistory.push({ 'department': obj, 'departmentData': response[obj] });
        }
        if (response[this.departments[0]][0].name) {
          this.name = response[this.departments[0]][0].name;
        }
        if (response[this.departments[0]][0].name) {
          this.userName = response[this.departments[0]][0].userName;
        }
        let currentDate = new Date();
        for (let objAvailableHistory of this.availableHistory) {
          objAvailableHistory.departmentData = _.sortBy(objAvailableHistory.departmentData, 'userName');
          for (let dIndex in objAvailableHistory.departmentData) {
            for (const accDetails of objAvailableHistory.departmentData[dIndex].accountingDetails) {
              if (objAvailableHistory.departmentData[dIndex].accountingDetails !== undefined && objAvailableHistory.departmentData[dIndex].accountingDetails.length > 0) {
                // objAvailableHistory.departmentData[dIndex].accountingDetails = objAvailableHistory.departmentData[dIndex].accountingDetails[0];

                // convert date in to ET time
                if (accDetails.verifiedDate) {
                  accDetails.verifiedDate = moment(accDetails.verifiedDate).tz('America/New_York').format('DD/MM/YYYY hh:mm A');
                }

                if (accDetails.reopenedDate) {
                  accDetails.reopenedDate = moment(accDetails.reopenedDate).tz('America/New_York').format('MM/DD/YYYY hh:mm A');
                }
                if (accDetails.sentForApprovalDate) {
                  accDetails.sentForApprovalDate = moment(accDetails.sentForApprovalDate).tz('America/New_York').format('DD/MM/YYYY hh:mm A');
                }

                // if (accDetails.checkInCheckOutDetails == undefined) {

                if (!this.isManagerMode) {
                  let date = new Date(accDetails.date);

                  if (this.userDetail.id == this.searchData.userId[0] && date <= currentDate || ((this.isTopManagementUser || this.isTimeAccountingManager) && date <= currentDate)) {
                    accDetails.isPlusIconEnable = true;
                  } else {
                    accDetails.isPlusIconEnable = false;
                  }
                }
                // }
                if (accDetails.checkInCheckOutDetails) {
                  for (let cIndex in accDetails.checkInCheckOutDetails) {
                    // push username and name in checkInCheckOutDetails 
                    accDetails.checkInCheckOutDetails[cIndex].userName = objAvailableHistory.departmentData[dIndex].userName;
                    accDetails.checkInCheckOutDetails[cIndex].name = objAvailableHistory.departmentData[dIndex].name;

                    // push  status in checkInCheckOutDetails if records were verified
                    if (accDetails.status) {
                      accDetails.checkInCheckOutDetails[cIndex].status = accDetails.status;
                    } else {
                      accDetails.checkInCheckOutDetails[cIndex].status = 'pending';
                    }

                    if (this.searchData.userId[0]) {
                      accDetails.checkInCheckOutDetails[cIndex].userId = this.searchData.userId[0];
                    }

                    if ((this.userDetail.id != objAvailableHistory.departmentData[dIndex].userId) && objAvailableHistory.departmentData[dIndex].isAbleToApprove == true && accDetails.checkInCheckOutDetails[cIndex].status == 'sentForApproval' || (this.userDetail.id == this.searchData.userId[0]) && accDetails.checkInCheckOutDetails[cIndex].status == 'pending' || (this.userDetail.isTopManagementUser == true || this.userDetail.isTimeAccountingManager)) {
                      accDetails.isPlusIconEnable = true;
                    } else {
                      accDetails.isPlusIconEnable = false;
                    }


                    // push isAbleToApprove flag in checkInCheckOutDetails(for rights of edit)
                    if (objAvailableHistory.departmentData[dIndex].isAbleToApprove !== undefined) {
                      accDetails.checkInCheckOutDetails[cIndex].isAbleToApprove = objAvailableHistory.departmentData[dIndex].isAbleToApprove;
                    }
                    if (accDetails.checkInCheckOutDetails[cIndex].history &&
                      accDetails.checkInCheckOutDetails[cIndex].history.length > 0) {
                      for (var obj of accDetails.checkInCheckOutDetails[cIndex].history) {
                        if (obj.field !== undefined && obj.field !== null && obj.field.length > 0) {
                          _.remove(obj.field, function (objField) {
                            return objField.name === 'updatedBy' || objField.name === 'updatedDate' || objField.name === 'source';
                          });
                        }
                      }
                      _.remove(accDetails.checkInCheckOutDetails[cIndex].history, function (obj) {
                        return obj.field === undefined || obj.field === null || obj.field.length === 0;
                      })
                    }
                    // rules
                    if ((this.userDetail.id === this.searchData.userId[0] && (accDetails.status == 'pending' || accDetails.status == 'reopened')) ||
                      (this.isTopManagementUser == true && (accDetails.status == 'pending' || accDetails.status == 'reopened'))) {
                      accDetails.hasButtonEnable = true;
                    } else {
                      accDetails.hasButtonEnable = false;
                    }

                    // rules
                    if ((this.userDetail.id === objAvailableHistory.departmentData[dIndex].userId && (accDetails.status == 'pending' || accDetails.status == 'reopened')) ||
                      (this.isTopManagementUser == true && (accDetails.status == 'pending' || accDetails.status == 'reopened'))) {
                      accDetails.isRqstAprvShow = true;
                    } else {
                      accDetails.isRqstAprvShow = false;
                    }
                  }
                  // process for row data to bind in ag-grid 
                  this.CheckInOutUserGridData = accDetails.checkInCheckOutDetails;
                  this.originalData = JSON.parse(JSON.stringify(this.CheckInOutUserGridData));

                  if (accDetails.checkInCheckOutDetails && accDetails.checkInCheckOutDetails.length > 0) {

                    let checkInOutData = _.sortBy(accDetails.checkInCheckOutDetails, (obj) => {
                      return obj.checkIn;
                    });
                    accDetails.checkInCheckOutDetails = JSON.parse(JSON.stringify(checkInOutData));

                    for (let index in accDetails.checkInCheckOutDetails) {
                      if (accDetails.checkInCheckOutDetails[index] && (accDetails.checkInCheckOutDetails[index].checkIn || accDetails.checkInCheckOutDetails[index].checkOut)) {
                        let checkInTime = accDetails.checkInCheckOutDetails[index].checkIn;
                        let checkOutTime = accDetails.checkInCheckOutDetails[index].checkOut;
                        checkInOutData.shift();
                        let overlapped: any = checkInOutData.filter(element => {
                          if (element.checkOut && checkOutTime) {
                            return ((checkInTime === element.checkIn && checkOutTime === element.checkOut)
                              || (checkInTime <= element.checkIn && checkOutTime >= element.checkOut)
                              || (checkInTime >= element.checkIn && checkOutTime <= element.checkOut)
                              || (checkInTime < element.checkOut && checkOutTime > element.checkIn)) && !element.isDeleted
                          } else if (!element.checkOut) {
                            return ((checkInTime === element.checkIn)
                              || (checkInTime >= element.checkIn && checkOutTime >= element.checkIn)
                              || (checkInTime <= element.checkIn && checkOutTime >= element.checkIn))
                              || (element.checkIn <= checkInTime) && !element.isDeleted
                          } else if (!checkOutTime) {
                            return ((checkInTime === element.checkIn)
                              || (checkInTime >= element.checkIn && checkInTime <= element.checkOut)
                              || (checkInTime <= element.checkIn)) && !element.isDeleted
                          }
                        });
                        accDetails.checkInCheckOutDetails[index].overlapped = overlapped;
                        if (overlapped && overlapped.length > 0) {
                          accDetails.checkInCheckOutDetails[index].overlappedReason = 'This is an overlapping entry for ';
                          for (let reason of overlapped) {
                            accDetails.checkInCheckOutDetails[index].overlappedReason += moment(reason.checkIn).tz('America/New_York').format('hh:mm A') + ' - ' + moment(reason.checkOut).tz('America/New_York').format('hh:mm A') + ', ';
                          }
                          if (accDetails.checkInCheckOutDetails[index].overlappedReason) {
                            let abc = accDetails.checkInCheckOutDetails[index].overlappedReason.length - 1;
                            if (accDetails.checkInCheckOutDetails[index].overlappedReason[abc - 1] === ',') {
                              accDetails.checkInCheckOutDetails[index].overlappedReason = accDetails.checkInCheckOutDetails[index].overlappedReason.substring(0, abc - 1);
                            }
                          }
                        }
                      }
                      let checkInIdData = _.sortBy(accDetails.checkInCheckOutDetails, (obj) => {
                        return obj.checkInId;
                      });

                      for (let ind in accDetails.checkInCheckOutDetails) {
                        if (!accDetails.checkInCheckOutDetails[ind].isDeleted) {
                          let overlappedIn: any = checkInIdData.filter(element => {
                            return (element.overlapped && element.overlapped.findIndex(t => t.checkInId == accDetails.checkInCheckOutDetails[ind].checkInId) > -1 && !element.isDeleted && accDetails.checkInCheckOutDetails[ind].checkInId !== element.checkInId)
                          });
                          accDetails.checkInCheckOutDetails[ind].overlappedIn = overlappedIn;
                          if (overlappedIn && overlappedIn.length > 0) {

                            if (accDetails.checkInCheckOutDetails[ind] && accDetails.checkInCheckOutDetails && accDetails.checkInCheckOutDetails[ind].overlappedReason && accDetails.checkInCheckOutDetails[ind].overlappedReason.length > 0) {
                              accDetails.checkInCheckOutDetails[ind].overlappedReason += '\n' + 'This entry is overlapped in ';
                              for (let reason of overlappedIn) {
                                accDetails.checkInCheckOutDetails[ind].overlappedReason += moment(reason.checkIn).format('hh:mm A') + ' - ' + moment(reason.checkOut).format('hh:mm A') + ', ';
                              }
                              if (accDetails.checkInCheckOutDetails[ind].overlappedReason) {
                                let abc = accDetails.checkInCheckOutDetails[ind].overlappedReason.length - 1;
                                if (accDetails.checkInCheckOutDetails[ind].overlappedReason[abc - 1] === ',') {
                                  accDetails.checkInCheckOutDetails[ind].overlappedReason = accDetails.checkInCheckOutDetails[ind].overlappedReason.substring(0, abc - 1);
                                }
                              }

                            } else {
                              accDetails.checkInCheckOutDetails[ind].overlappedInReason = 'This entry is overlapped in ';
                              for (let reason of overlappedIn) {
                                accDetails.checkInCheckOutDetails[ind].overlappedInReason += moment(reason.checkIn).format('hh:mm A') + ' - ' + moment(reason.checkOut).format('hh:mm A') + ', ';
                              }
                              if (accDetails.checkInCheckOutDetails[ind].overlappedInReason) {
                                let abc = accDetails.checkInCheckOutDetails[ind].overlappedInReason.length - 1;
                                if (accDetails.checkInCheckOutDetails[ind].overlappedInReason[abc - 1] === ',') {
                                  accDetails.checkInCheckOutDetails[ind].overlappedInReason = accDetails.checkInCheckOutDetails[ind].overlappedInReason.substring(0, abc - 1);
                                }
                              }
                            }
                          }
                        }
                      }
                      if (accDetails.checkInCheckOutDetails[index] && accDetails.checkInCheckOutDetails[index].checkIn) {
                        // converted to ET time and 24 hours formate (used for sorting)
                        accDetails.checkInCheckOutDetails[index].checkInTime = moment(accDetails.checkInCheckOutDetails[index].checkIn).tz('America/New_York').format('hh:mm A');
                        // accDetails.checkInCheckOutDetails.sort((a, b) => 0 - (a.checkInTime > b.checkInTime ? 1 : -1));
                        // converted to ET time and 12 hours formate (used to bind in greed)
                        accDetails.checkInCheckOutDetails[index].checkIn = moment(accDetails.checkInCheckOutDetails[index].checkIn).tz('America/New_York').format('hh:mm A');
                      }
                      if (accDetails.checkInCheckOutDetails[index] && accDetails.checkInCheckOutDetails[index].checkOut) {

                        accDetails.checkInCheckOutDetails[index].checkOutTime = moment(accDetails.checkInCheckOutDetails[index].checkOut).tz('America/New_York').format('hh:mm A');
                        accDetails.checkInCheckOutDetails[index].checkOut = moment(accDetails.checkInCheckOutDetails[index].checkOut).tz('America/New_York').format('hh:mm A');
                      }

                      if (accDetails.checkInCheckOutDetails[index].duration !== undefined &&  accDetails.checkInCheckOutDetails[index].duration !== null) {
                        accDetails.checkInCheckOutDetails[index].duration = this.convertSecondsToHours(accDetails.checkInCheckOutDetails[index].duration, true);
                      }
                    }
                  }

                }
              } else {
                objAvailableHistory.departmentData[dIndex].accountingDetails[0] = { "checkInCheckOutDetails": [] };
              }
            }
          }

        }
        if (this.isManagerMode) {
          this.searchDtuManagerView(true);
        } else {
          this.searchDailyTimeUsage();
        }
      }

      const self = this;
      setTimeout(() => {
        self.cdrService.callDetectChanges(self.cdr);
      }, 1000);

    }
    this.availableHistory.forEach(element => {
      element.departmentData.forEach(element1 => {
        element1.accountingDetails.sort((a, b) => 0 - (a.date > b.date ? 1 : -1));
      });
    });
    console.log(this.availableHistory);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 11/03/2020
   * @discriptioncall get graph data From Api
   * @memberOf CheckinoutHistoryUserComponent
   */
  searchDtuManagerView(isValid: boolean): void {
    const self = this;
    const searchDaily = JSON.parse(JSON.stringify(self.searchData));
    searchDaily.userId = [];
    if (this.isFromReminder) {
      let minValue = _.minBy(this.filterForGraph, function (o) { return o.date; });
      let maxValue = _.maxBy(this.filterForGraph, function (o) { return o.date; });
      if (minValue) {
        searchDaily.startTime = moment(minValue.date).format('YYYY-MM-DD') + 'T00:00:00' + (self.isDST(minValue.date) ? '-04:00' : '-05:00');
      }

      if (maxValue) {
        searchDaily.endTime = moment(maxValue.date).format('YYYY-MM-DD') + 'T23:59:59' + (self.isDST(maxValue.date) ? '-04:00' : '-05:00');
      }

      for (const obj of this.filterForGraph) {
        searchDaily.userId.push({ 'id': obj.userId });
      }

    } else {
      if (self.searchData.startDate !== undefined && self.searchData.startDate !== null) {
        // let startTimeValue = moment(self.historySearch.startDate, 'YYYY-MM-DD').startOf('week').format();
        searchDaily.startTime = moment(self.searchData.startDate).startOf('week').format('YYYY-MM-DD') + 'T00:00:00' + (self.isDST(self.searchData.startDate) ? '-04:00' : '-05:00');
        searchDaily.endTime = moment(self.searchData.startDate).format('YYYY-MM-DD') + 'T23:59:59' + (self.isDST(self.searchData.startDate) ? '-04:00' : '-05:00');
      }

      for (const obj of self.searchData.userId) {
        searchDaily.userId.push({ 'id': obj });
      }
    }

    searchDaily.startDate = undefined;
    searchDaily.endDate = undefined;
    searchDaily.break = 300;
    searchDaily.morningPreparationTime = 0;
    searchDaily.eveningWindDown = 0;
    searchDaily.responsiblerPersonResult = JSON.parse(JSON.stringify(this.searchData.userId));
    searchDaily.responsiblerPersonResultValue = JSON.parse(JSON.stringify(this.searchData.userId));

    // searchDaily.responsiblerPersonResult = this.searchData.userId;
    // searchDaily.responsiblerPersonResultValue = this.searchData.userId;
    searchDaily.chatInteract = "user";
    self.isShowGraph = false;
    this.timeAccountingSrvice.getDialyTimeUsage(searchDaily).then((response: any) => {
      if (Object.keys(response).length > 0) {
        for (const res of response) {
          if (this.isFromReminder) {
            let minValue = _.minBy(this.filterForGraph, function (o) { return o.date; });
            let maxValue = _.maxBy(this.filterForGraph, function (o) { return o.date; });
            self.options.MinRange = minValue.date;
            self.options.MaxRange = maxValue.date;
          } else {
            self.options.MinRange = self.searchData.startDate;
            self.options.MaxRange = self.searchData.startDate;
          }

          self.setClass(res.WDATA, 'totalTimePresent', 'desc', 'isSownTopByPresent');
          self.setClass(res.WDATA, 'totalBreakTime', 'asc', 'isSownTopByBreak');
          self.setClass(res.WDATA, 'totalCallTime', 'desc', 'isSownTopByNet');
          self.options.data = JSON.parse(JSON.stringify(res.WDATA));
          self.minBreakPeriod = res.minBreakPeriod;
          if (self.options.data !== undefined && self.options.data.length > 0) {
            for (const userCallData of self.options.data) {
              userCallData.totalTimePresent = self.hhmmss(userCallData.totalTimePresent);
              userCallData.totalBreakTime = self.hhmmss(userCallData.totalBreakTime);
              userCallData.totalCallTime = self.hhmmss(userCallData.totalCallTime);
              userCallData.noOfBreaks = userCallData.noOfBreaks !== undefined ? userCallData.noOfBreaks : '';
            }
          }
          for (const obj of self.options.data) {
            if (obj.timingData !== undefined && obj.timingData.length > 0) {
              for (const times of obj.timingData) {
                times.SEC = (times.SEC / 60).toFixed(0);
                if (obj.breakExplanation) {
                  if (times.TYP === 'break') {
                    if (times.SEC > self.minBreakPeriod) {
                      times.longerBreak = true;
                    }
                  }
                }
              }
            }
          }

          let allData = [];
          for (let resData of response) {
            for (let wdata of resData.WDATA) {
              if (wdata.timingData && wdata.timingData.length > 0) {
                if (res.WK == resData.WK) {
                  for (const times of wdata.timingData) {
                    times.SEC = (times.SEC / 60).toFixed(0);
                    if (wdata.breakExplanation) {
                      if (times.TYP === 'break') {
                        if (times.SEC > self.minBreakPeriod) {
                          times.longerBreak = true;
                        }
                      }
                    }
                  }
                }
              }

              for (const history of self.availableHistory) {
                if (wdata.breakExplanation) {
                  for (const dept of history.departmentData) {
                    if (dept.userId == wdata.UID) {
                      for (const accDetails of dept.accountingDetails) {
                        if (wdata.DT == moment(accDetails.date).format('MM/DD/YYYY')) {
                          if (wdata.timingData && wdata.timingData.length > 0) {
                            if (res.WK == resData.WK) {
                              for (const object of wdata.timingData) {
                                if (accDetails.breakDetailsLeft == undefined) {
                                  accDetails.breakDetailsLeft = [];
                                }
                                if (object.TYP === 'break') {
                                  if (accDetails.breakDetails && accDetails.breakDetails.length > 0) {
                                    for (let breakDetails of accDetails.breakDetails) {
                                      breakDetails.longerBreak = true;
                                      if (moment(breakDetails.startTime).format('hh:mm:ss A') == object.ST && moment(breakDetails.endTime).format('hh:mm:ss A') == object.ET) {
                                        object.longerBreak = true;
                                      }
                                    }
                                  }
                                  if (object.SEC > self.minBreakPeriod || object.longerBreak) {
                                    if (accDetails.breakDetailsLeft == undefined) {
                                      accDetails.breakDetailsLeft = [];
                                    }
                                    let json = {
                                      'startTime': wdata.DT + ' ' + object.ST,
                                      'endTime': wdata.DT + ' ' + object.ET,
                                      'duration': object.SEC,
                                      'explanation': wdata.explanation,
                                      'longerBreak': object.longerBreak ? true : false
                                    }
                                    if (accDetails.breakDetails !== undefined && accDetails.breakDetails.length > 0) {
                                      let similarBreakDetails = accDetails.breakDetails.findIndex(t => t.startTime === json.startTime && !t.isDeleted);
                                      // || accDetails.breakDetails.findIndex(t => t.endTime === json.endTime)
                                      if (similarBreakDetails == -1) {
                                        //     accDetails.breakDetailsLeft.push(accDetails.breakDetails[similarBreakDetails]);
                                        // } else {
                                        accDetails.breakDetailsLeft.push(json);
                                      }
                                    } else {
                                      accDetails.breakDetailsLeft.push(json);
                                    }
                                  }
                                }
                              }
                              if (accDetails.breakDetails && accDetails.breakDetails.length > 0) {
                                accDetails.breakDetails.forEach(function (v) { v.existingBreak = true });
                                accDetails.breakDetailsLeft = accDetails.breakDetailsLeft.concat(accDetails.breakDetails);
                              }

                            }
                          }
                        }

                      }
                    }
                  }
                }
              }

              allData.push(wdata);
            }
          }

          if (this.options !== undefined && this.options !== null) {
            const options = JSON.parse(JSON.stringify(this.options));
            for (const his of this.availableHistory) {
              for (const depData of his.departmentData) {
                if (depData.accountingDetails && depData.accountingDetails.length > 0) {
                  for (const acc of depData.accountingDetails) {
                    acc.options = JSON.parse(JSON.stringify(options));
                    acc.options.data = [];
                    const foundObj = allData.find(obj => obj.UID === depData.userId && moment(acc.date).format('MM/DD/YYYY') === obj.DT);
                    if (foundObj !== undefined && foundObj.timingData !== undefined && foundObj.timingData !== null && foundObj.timingData.length > 0) {
                      acc.options.data.push(foundObj);
                      acc.showGraph = true;
                    }
                  }

                }

              }
            }
          }
        }
      }

      const that = self;
      setTimeout(() => {
        that.isGraphLoaded.emit(true);
        that.isShowGraph = true;
        that.cdrService.callDetectChanges(that.cdr);
      }, 10);

      self.cdrService.callDetectChanges(self.cdr);
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall Function call For search Data As per Customer Search
   * @memberOf CheckinoutHistoryUserComponent
   */
  public searchDailyTimeUsage(): any {
    const searchDaily = JSON.parse(JSON.stringify(this.searchData));
    searchDaily.startTime = this.searchData.startDate;
    searchDaily.endTime = this.searchData.endDate;
    if (this.isFromReminder) {
      let minDate = _.minBy(this.filterForGraph);
      let minValue = moment(minDate, 'YYYY-MM-DD').startOf('week').format();
      let maxValue = _.maxBy(this.filterForGraph);
      if (minValue) {
        searchDaily.startTime = moment(minValue).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(minValue) ? '-04:00' : '-05:00');
      }
      // pass as local date
      if (maxValue) {
        searchDaily.endTime = moment(maxValue).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(maxValue) ? '-04:00' : '-05:00');
      }
    } else {
      if (searchDaily.startTime !== undefined && searchDaily.startTime !== null) {
        searchDaily.startTime = moment(searchDaily.startTime).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(searchDaily.startTime) ? '-04:00' : '-05:00');
      }
      // pass as local date
      if (searchDaily.startTime !== undefined && searchDaily.endTime !== null) {
        searchDaily.endTime = moment(searchDaily.endTime).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(searchDaily.endTime) ? '-04:00' : '-05:00');
      }
    }
    searchDaily.userId = [];
    for (let data of this.searchData.userId) {
      searchDaily.userId.push({ 'id': data });
    }
    searchDaily.responsiblerPersonResult = JSON.parse(JSON.stringify(this.searchData.userId));
    searchDaily.responsiblerPersonResultValue = JSON.parse(JSON.stringify(this.searchData.userId));
    searchDaily.break = 300;
    searchDaily.morningPreparationTime = 0;
    searchDaily.eveningWindDown = 0;
    searchDaily.chatInteract = "user";
    this.cdrService.callDetectChanges(this.cdr);
    this.isShowDraw = false;
    const self = this;
    self.timeAccountingSrvice.getDialyTimeUsage(searchDaily).then((response: any) => {
      this.options.data = [];
      this.optionsArray = [];
      for (const useDatas of response) {
        const op = JSON.parse(JSON.stringify(this.options));
        const diff = moment(useDatas.ED, 'MM/DD/YYYY').diff(moment(useDatas.SD, 'MM/DD/YYYY'), 'days') + 1;
        const WData = [];
        for (let i = 0; i < diff; i++) {
          const DateForFound = moment(useDatas.SD, 'MM/DD/YYYY').add(i, 'days');
          const dateFound = useDatas.WDATA.find(function (o) { return moment(o.DT, 'MM/DD/YYYY').diff(DateForFound, 'days') === 0; });
          if (dateFound === undefined) {
            WData.push({ 'DT': moment(DateForFound).format('MM/DD/YYYY'), 'timingData': [] });
          } else {
            WData.push(dateFound);
          }
        }
        this.setClass(WData, 'totalTimePresent', 'desc', 'isSownTopByPresent');
        this.setClass(WData, 'totalBreakTime', 'asc', 'isSownTopByBreak');
        this.setClass(WData, 'totalCallTime', 'desc', 'isSownTopByNet');
        this.calculateAverage(op, WData);
        op.data = WData;
        self.minBreakPeriod = useDatas.minBreakPeriod;
        if (op.data !== undefined && op.data.length > 0) {
          for (const userCallData of op.data) {
            userCallData.totalTimePresent = this.hhmmss(userCallData.totalTimePresent);
            userCallData.totalBreakTime = this.hhmmss(userCallData.totalBreakTime);
            userCallData.totalCallTime = this.hhmmss(userCallData.totalCallTime);
            userCallData.noOfBreaks = userCallData.noOfBreaks !== undefined ? userCallData.noOfBreaks : '';
          }
        }
        // op.chart.YDateStartLabel = useDatas.ED;
        // op.MinRange = useDatas.SD;
        // op.MaxRange = useDatas.ED;
        this.optionsArray.push(op);
      }
      if (this.optionsArray !== undefined && this.optionsArray.length > 0) {
        for (const optionsArrays of this.optionsArray) {
          for (const obj of optionsArrays.data) {
            if (obj.timingData !== undefined && obj.timingData.length > 0) {
              for (const times of obj.timingData) {
                times.SEC = (times.SEC / 60).toFixed(0);
                if (obj.breakExplanation) {
                  if (times.TYP === 'break') {
                    if (times.SEC > self.minBreakPeriod) {
                      times.longerBreak = true;
                    }
                  }
                }
              }
            }

            for (let dept of self.availableHistory) {
              for (let deptData of dept.departmentData) {
                for (let history of deptData.accountingDetails) {
                  if (obj.DT == moment(history.date).format('MM/DD/YYYY') && obj.breakExplanation) {
                    for (const object of obj.timingData) {
                      if (history.breakDetailsLeft == undefined) {
                        history.breakDetailsLeft = [];
                      }
                      if (object.TYP === 'break') {
                        if (history.breakDetails && history.breakDetails.length > 0) {
                          for (let breakDetailsObj of history.breakDetails) {
                            breakDetailsObj.longerBreak = true;
                            if (moment(breakDetailsObj.startTime).format('hh:mm:ss A') == object.ST && moment(breakDetailsObj.endTime).format('hh:mm:ss A') == object.ET) {
                              object.longerBreak = true;
                            }
                          }
                        }
                        if (object.SEC > self.minBreakPeriod || object.longerBreak) {
                          if (history.breakDetailsLeft == undefined) {
                            history.breakDetailsLeft = [];
                          }

                          let json = {
                            'startTime': obj.DT + ' ' + object.ST,
                            'endTime': obj.DT + ' ' + object.ET,
                            'duration': object.SEC,
                            'explanation': obj.explanation,
                            'longerBreak': object.longerBreak ? true : false
                          }
                          let similarBreakDetailsLeft = history.breakDetailsLeft.findIndex(t => t.startTime === json.startTime);
                          // || history.breakDetailsLeft.findIndex(t => t.endTime === json.endTime)
                          if (similarBreakDetailsLeft < 0) {
                            if (history.breakDetails !== undefined && history.breakDetails.length > 0) {
                              let similarBreakDetails = history.breakDetails.findIndex(t => t.startTime === json.startTime && !t.isDeleted);
                              // || history.breakDetails.findIndex(t => t.endTime === json.endTime)
                              if (similarBreakDetails == -1) {
                                //     history.breakDetailsLeft.push(history.breakDetails[similarBreakDetails]);
                                // } else {
                                history.breakDetailsLeft.push(json);
                              }
                            } else {
                              history.breakDetailsLeft.push(json);
                            }
                          }

                        }
                      }
                    }
                    if (history.breakDetails && history.breakDetails.length > 0) {
                      history.breakDetails.forEach(function (v) { v.existingBreak = true });
                      history.breakDetailsLeft = history.breakDetailsLeft.concat(history.breakDetails);
                    }
                  }
                }
              }


            }
          }
        }
      }
      // this.optionsArray = this.optionsArray.reverse();
      // for (const OptionData of this.optionsArray) {
      //     OptionData.data.reverse();
      // }
      if (this.optionsArray !== undefined && this.optionsArray !== null && this.optionsArray.length > 0) {
        this.optionsArrayData = JSON.parse(JSON.stringify(this.optionsArray));
        for (const options of this.optionsArray) {
          // const options = JSON.parse(JSON.stringify(this.optionsArray[0]));
          const optionsData = JSON.parse(JSON.stringify(options.data));
          // const optionsData = JSON.parse(JSON.stringify(this.optionsArray[0].data));
          options.data = [];
          for (let dept of self.availableHistory) {
            for (let deptData of dept.departmentData) {
              for (let his of deptData.accountingDetails) {
                for (const d of optionsData) {
                  if (moment(his.date).format('MM/DD/YYYY') === d.DT) {
                    if (d !== undefined && d.timingData !== undefined && d.timingData !== null && d.timingData.length > 0) {
                      his.options = JSON.parse(JSON.stringify(options));
                      his.options.MinRange = moment(d.DT).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(d.DT) ? '-04:00' : '-05:00');
                      his.options.MaxRange = moment(d.DT).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(d.DT) ? '-04:00' : '-05:00');
                      his.options.data.push(d);
                      his.showGraph = true;
                    } else {
                      his.showGraph = false;
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.cdrService.callDetectChanges(this.cdr);
      const that = self;
      setTimeout(() => {
        that.isShowDraw = true;
        that.isGraphLoaded.emit(true);
        that.cdrService.callDetectChanges(this.cdr);
      }, 10);
      self.cdrService.callDetectChanges(this.cdr);
    }, (error) => {
      this.isShowDraw = false;
      console.log(error);
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall set calss name as top middle and bottom
   * @memberOf CheckinoutHistoryUserComponent
   */
  public setClass(userData: any, field: any, orderBy: any, setFiledName: any) {
    const removeData = _.remove(userData, function (o) { return o[field] === undefined; });
    const sortArrayByPresent = _.orderBy(userData, [field], [orderBy]);
    let totalUser = sortArrayByPresent.length;
    const i2 = sortArrayByPresent.length % 3;
    totalUser = totalUser - i2;
    totalUser = totalUser / 3;
    for (let i1 = 0; i1 < sortArrayByPresent.length; i1++) {
      if (sortArrayByPresent.length < 3) {
        if (i1 === 0) {
          sortArrayByPresent[i1][setFiledName] = 'top';
        } else {
          sortArrayByPresent[i1][setFiledName] = 'bottom';
        }
      } else if (i1 < (totalUser)) {
        sortArrayByPresent[i1][setFiledName] = 'top';
      } else if (i1 < ((totalUser * 2) + i2)) {
        sortArrayByPresent[i1][setFiledName] = 'middle';
      } else if (i1 < ((totalUser * 3) + i2)) {
        sortArrayByPresent[i1][setFiledName] = 'bottom';
      }
    }
    if (removeData !== undefined && removeData.length > 0) {
      for (const addData of removeData) {
        userData.push(addData);
      }
    }
  }

  public hhmmss(minutes: any): any {
    if (minutes === undefined) {
      return '';
    }
    minutes = Math.round(minutes);
    const hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ':' + this.pad(minutes);
  }

  public pad(num: any): any {
    return ('0' + num).slice(-2);
  }

  public isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall call when user click on plus icon to add record
   * @memberOf CheckinoutHistoryUserComponent
   */
  public manualEntry(date, event) {
    event.stopPropagation();
    const self = this;
    this.dialogService.custom(CheckinoutManualComponent, { 'data': { 'mode': 'new', 'userName': this.userName, 'name': this.name, 'date': date } }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
      if (result) {
        if (this.isFromReminder) {
          this.updateReminderData.emit();
        } else {
          self.getCheckInStatus.emit(true);
        }
      }
    },
      (error) => { console.error(error); }
    );
  }

  /**
 * @author Mansi Makwana
 * @createdDate 03/03/2020
 * @discriptioncall open breakdetails dialog
 * @memberOf CheckinoutHistoryUserComponent
 */
  getBreakDetailsHistory(data, userName?) {
    this.dialogService.custom(BreakDetailComponent, { lookup: this.lookup, breakDetails: JSON.parse(JSON.stringify(data.breakDetails)), userName: userName, date: data.date, minBreakPeriod: this.minBreakPeriod, noSaveCancel: true }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
      (result) => {
      },
      (error) => {
      }
    );
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall open breakdetails dialog
   * @memberOf CheckinoutHistoryUserComponent
   */
  setBreakDetails(data, userName?) {
    this.dialogService.custom(BreakDetailComponent, { lookup: this.lookup, breakDetails: data.breakDetailsLeft, userName: userName, date: data.date, minBreakPeriod: this.minBreakPeriod }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
      (result: any) => {
        if (result != undefined) {
          // this.breakDetails = result;
          let json = {
            'date': data.date,
            'docId': data.checkInCheckOutDetails[0].docId,
            'status': data.status,
            'breakDetails': result.breakDetails
          }
          // call api to approve records
          this.timeAccountingSrvice.verifyCheckInOutRecords(json).then((response) => {
            if (this.isFromReminder) {
              this.updateReminderData.emit();
            } else {
              this.getCheckInStatus.emit();
            }
          }, (error) => {
            console.log(error);
          });
        }
      });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall to open confirm dialog to check break
   * @memberOf CheckinoutHistoryUserComponent
   */
  confirmAsBreak(data) {
    if (data.isBreakIcon) {
      for (let dept of this.availableHistory) {
        for (let deptData of dept.departmentData) {
          for (let history of deptData.accountingDetails) {
            if (data.date == moment(history.date).format('MM/DD/YYYY')) {
              for (const breakHistory of history.breakDetailsLeft) {
                if (((breakHistory.startTime == moment(data.date + ' ' + data.ST).format('MM/DD/YYYY hh:mm:ss A')) && (breakHistory.endTime == moment(data.date + ' ' + data.ET).format('MM/DD/YYYY hh:mm:ss A'))) || ((breakHistory.startTime == moment(data.date + ' ' + data.ST).format('MM/DD/YYYY hh:mm:ss A')) && breakHistory.existingBreak)) {
                  this.dialogService.custom(BreakDetailComponent, { lookup: this.lookup, breakDetails: JSON.parse(JSON.stringify([breakHistory])), userName: this.userName, date: data.date, minBreakPeriod: this.minBreakPeriod, noSaveCancel: (deptData.isAbleToApprove && history.status !== undefined && history.status !== 'approved') || (history.status !== undefined && history.status !== 'sentForApproval' && history.status !== 'approved') ? false : true, onlyDisplay: true }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then(
                    (result: any) => {
                      if (result !== undefined) {
                        // this.breakDetails = result;
                        if (history.breakDetails && history.breakDetails.length > 0) {
                          let isResultIndex = history.breakDetails.findIndex(t => t.startTime === result.breakDetails[0].startTime);
                          if (isResultIndex > -1) {
                            history.breakDetails[isResultIndex] = result.breakDetails[0]
                          } else {
                            history.breakDetails.push(result.breakDetails[0])
                          }
                        }
                        let json = {
                          'date': history.date,
                          'docId': history.checkInCheckOutDetails[0].docId,
                          'status': history.status,
                          'breakDetails': history.breakDetails && history.breakDetails.length > 0 ? history.breakDetails : result.breakDetails
                        }
                        // call api to approve records
                        this.timeAccountingSrvice.verifyCheckInOutRecords(json).then((response) => {
                          if (this.isFromReminder) {
                            this.updateReminderData.emit();
                          } else {
                            this.getCheckInStatus.emit();
                          }
                        })
                      }
                    },
                    (error) => {
                      console.log(error);
                    }
                  );
                  break;
                }
              }
            }
          }
        }
      }
    } else {
      const dialogData = { title: 'Confirm', text: `Start Time: <b> ${data.ST} </b>, End Time: <b> ${data.ET} </b>, Duration: <b> ${data.SEC} </b> minutes <br> Are you sure you want to update this slot as a break?` };
      if (this.isManagement) {
        this.dialogService.confirm(dialogData, {}).result.then(
          (result) => {
            if (result === 'YES') {
              let breakDetails;
              let reqObj;
              for (const obj of this.optionsArrayData[0].data) {
                if (obj.breakExplanation) {
                  if (data.date == obj.DT) {
                    for (const history of this.availableHistory) {
                      if (obj.DT == moment(history.date).format('MM/DD/YYYY') && obj.breakExplanation) {
                        let json = {
                          'startTime': obj.DT + ' ' + data.ST,
                          'endTime': obj.DT + ' ' + data.ET,
                          'duration': data.SEC,
                          'reason': 'Break'
                        }

                        if (history.breakDetails !== undefined && history.breakDetails.length > 0) {
                          breakDetails = history.breakDetails;
                          breakDetails.push(json);
                        } else {
                          breakDetails = [json];
                        }

                        reqObj = {
                          'date': history.date,
                          'docId': history.checkInCheckOutDetails[0].docId,
                          'status': history.status,
                          'breakDetails': breakDetails
                        }
                        break;
                      }

                    }
                  }
                }
              }
              // call api to approve records
              this.timeAccountingSrvice.verifyCheckInOutRecords(reqObj).then((response) => {
                if (this.isFromReminder) {
                  this.updateReminderData.emit();
                } else {
                  this.getCheckInStatus.emit();
                }
              })
            }
          })
      }
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall to open Reopned History dialog
   * @memberOf CheckinoutHistoryUserComponent
   */
  showReopenedHistory(data) {
    this.dialogService.custom(ReopenedHistoryComponent, { 'data': data.reopenedHistory }, { keyboard: true, backdrop: 'static', size: 'lg' })
      .result.then(() => {

      }, function (btn: any): void {
      });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall calculate Average Function
   * @memberOf CheckinoutHistoryUserComponent
   */
  public calculateAverage(option: any, calculatedData: any) {
    const CaurrentData = JSON.parse(JSON.stringify(calculatedData));
    let ConterTotalCallTime = 0;
    let ConterTotalTimePresent = 0;
    let ConterTotalBreakTime = 0;
    this.averageCouters = { 'totalTimePresent': 0, 'totalBreakTime': 0, 'totalCallTime': 0 };
    for (const calc of CaurrentData) {
      if (calc.totalTimePresent !== undefined && calc.totalTimePresent !== '') {
        this.averageCouters.totalTimePresent = this.averageCouters.totalTimePresent + calc.totalTimePresent;
        ConterTotalTimePresent++;
      }
      if (calc.totalBreakTime !== undefined && calc.totalBreakTime !== '') {
        this.averageCouters.totalBreakTime = this.averageCouters.totalBreakTime + calc.totalBreakTime;
        ConterTotalBreakTime++;
      }
      if (calc.totalCallTime !== undefined && calc.totalCallTime !== '') {
        this.averageCouters.totalCallTime = this.averageCouters.totalCallTime + calc.totalCallTime;
        ConterTotalCallTime++;
      }
    }
    this.averageCouters.totalTimePresent = this.hhmmss((this.averageCouters.totalTimePresent / ConterTotalTimePresent));
    this.averageCouters.totalBreakTime = this.hhmmss((this.averageCouters.totalBreakTime / ConterTotalBreakTime));
    this.averageCouters.totalCallTime = this.hhmmss((this.averageCouters.totalCallTime / ConterTotalCallTime));
    option.averageCouters = JSON.parse(JSON.stringify(this.averageCouters));
  }

  ngOnInit(): void {
    this.initCalled = true;
    this.isManagement = this.userService.getProperty('isManagementUser');

  }

  ngOnChanges(changes) {
    if (this.initCalled) {
      if (changes.dataForPendingRequests) {
        this.setAvailableHistory(this.dataForPendingRequests)
      }
      if (this.isManagerMode) {
        if (changes.dataForPendingApprovals) {
          this.setAvailableHistory(this.dataForPendingApprovals);
        }
      }
    }
  }
}


