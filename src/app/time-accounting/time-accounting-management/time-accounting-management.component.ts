// External imports
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from 'moment-timezone'
import { NgSelectComponent } from "@ng-select/ng-select";
import * as _ from 'lodash';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';

// Internal imports
import { UserService, MessageService, CDRService, DialogService } from '@app/shared/services'
import { environment } from '@environments/environment';
import { HourMinuteSecondPipe } from '@app/shared/pipe/common.pipe';
import { TimeAccountingService } from '@app/time-accounting/time-accounting.service';
import { TimeAccountingDetailsComponent } from '@app/time-accounting/components/time-accounting-details/time-accounting-details.component';

@Component({
  selector: 'app-time-accounting-management',
  templateUrl: './time-accounting-management.component.html',
  styleUrls: ['./time-accounting-management.component.scss'],
  providers: [TimeAccountingService, NgbPopoverConfig],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAccountingManagementComponent implements OnInit {

  @Input() isFromReminder: boolean = false;
  @Input() dataForPendingRequests: any = {};
  @Input() filterForGraph: any = [];
  @Output() isGraphLoaded = new EventEmitter();
  @Output() updateReminderData = new EventEmitter();
  @Input() dataForPendingApprovals: any = {};
  @ViewChild(TimeAccountingDetailsComponent, { static: false }) timeAccountingDetails: TimeAccountingDetailsComponent;
  public initCalled: boolean = false;
  public disableSearch: boolean = false; // to disable search button
  public historySearch: any = { 'userId': [] }; // to pass in api
  public responsiblePersonList: any = []; // store responsible person list from lookup
  public availableHistory: any = []; // store response of getCheckInStatus
  public departments: any = []; // to store department data
  public maxDate: Date; // used in date picker
  public isShowGraph: boolean = false; // show graph flag
  public isTopManagementUser: boolean = false;
  public isTimeAccountingManager: boolean = false;
  public disableNext: boolean = false;
  public userDetail: any;
  public showInfo: any;
  public environment = environment;
  public breakDetails: any = [];
  public minBreakPeriod: any;
  public actualResponsiblePersonList = [];
  public checkInOutUserForm: FormGroup;
  public userDetails: any; // store user's detail
  public isManagement: boolean = false; // check for management user
  public name: string;
  public userName: string;
  public previousDate: any = null;
  public isShowDraw: boolean = false; // show graph flag
  public optionsArray: any = [];
  public optionsArrayData: any = [];
  public approvalBreakDetails: any = [];
  public overallBreakDetails: any = [];
  public type = 'date';
  public format: any = 'MM/dd/y';
  public searchObject: any = {}; // to hold search criteria and pass as input data 
  public requestDataGraph: any; // hold the request data for display graph
  public displayDate: any;
  public modeList: any = [{ id: 'user', name: 'User' }, { id: 'manager', name: 'Manager' }];
  public modeType: string = 'user';
  public isManagerMode: boolean = false; // flag to identify which mode to show filters and result 
  public lookup: any = {};
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
      bandCount: 5,
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
  public averageCouters: any = { 'totalTimePresent': 0, 'totalBreakTime': 0, 'totalCallTime': 0 };

  constructor(private timeAccountingSrvice: TimeAccountingService,
    private dialogService: DialogService,
    private userService: UserService,
    private messageService: MessageService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    config: NgbPopoverConfig) {
    this.maxDate = new Date();
    // customize default values of popovers used by this component tree
    config.placement = 'right';
    config.triggers = 'hover';
  }

  public initCheckInOutUserForm() {
    this.checkInOutUserForm = this.fb.group({
      participants: [undefined, Validators.required],
      startDate: '',
      endDate: '',
      bandArray: [this.options.chart.bandCount, Validators.required],
    });
    if (!this.isManagerMode) {
      this.checkInOutUserForm.get('participants').setValue([this.userDetails.id]);
      this.checkInOutUserForm.controls['participants'].disable();
    } else {
      this.checkInOutUserForm.controls['participants'].enable();
    }

    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 04/03/2020
   * @discription clear drodown values
   * @memberof TimeAccountingManagementComponent
   */
  public onClearAll(clearSelectfor?: string): void {
    this.lookup.responsiblePersonList = this.actualResponsiblePersonList;
    if (clearSelectfor && this.checkInOutUserForm) {
      this.checkInOutUserForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 04/03/2020
   * @discription close on select
   * @memberof TimeAccountingManagementComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 04/03/2020
   * @discription clear drodown values
   * @memberof TimeAccountingManagementComponent
   */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'participants':
        selected = [];
        selected = this.lookup.responsiblePersonList.map(
          item => item.id
        );
        this.checkInOutUserForm.get('participants').patchValue(selected);
        break;
    }
  }


  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @param {*}  inputvalue
   * @memberof TimeAccountingManagementComponent
   */
  filterData(eventTarget) {
    this.lookup.responsiblePersonList = this.actualResponsiblePersonList;
    this.lookup.responsiblePersonList = this.lookup.responsiblePersonList
      .filter(obj => (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdr.detectChanges();
  }


  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription to set default date
   * @memberOf TimeAccountingManagementComponent
   */
  public setDefaultDate() {
    if (!this.isManagerMode) {
      this.historySearch.startDate = moment().startOf('week').format();
      this.historySearch.endDate = moment().endOf('week').format();
    } else {
      this.historySearch.startDate = new Date(moment().subtract(1, 'days').format('YYYY-MM-DD'));
      this.historySearch.endDate = new Date(moment().subtract(1, 'days').format('YYYY-MM-DD'));
    }
    let startdate = moment(this.historySearch.startDate).format('YYYY-MM-DD');
    let enddate = moment(this.historySearch.endDate).format('YYYY-MM-DD');
    this.checkInOutUserForm.controls.startDate.setValue(startdate);
    this.checkInOutUserForm.controls.endDate.setValue(enddate);
    this.cdrService.callDetectChanges(this.cdr);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discription getting the lookup values for responsible person's dropdown from the server api
   * @memberOf TimeAccountingManagementComponent
   */
  getLookupForHistorySearch() {
    this.disableSearch = true;
    this.timeAccountingSrvice.getLookupForTimeAccounting().then((response: any) => {
      this.disableSearch = false;
      this.lookup = JSON.parse(JSON.stringify(response));
      this.lookup.responsiblePersonList = [];
      this.actualResponsiblePersonList = JSON.parse(JSON.stringify(response.responsiblePersonList));
      for (const obj of response.responsiblePersonList) {
        const objname = this.lookup.responsiblePersonList.find((o) => { return obj.group === o.groupName; });
        if (objname !== undefined && objname !== null && objname !== '') {
          objname.group.push({ id: obj.id, name: obj.name });
        } else {
          this.lookup.responsiblePersonList.push({ group: obj.group, 'id': obj.id, 'name': obj.name });
        }
      }
      this.cdrService.callDetectChanges(this.cdr);
      if (!this.isFromReminder) {
        this.getCheckInStatus();
      }
    }, (error) => {
      this.disableSearch = false;
      this.cdrService.callDetectChanges(this.cdr);
      console.error(error);
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall when date is changed set date according to
   * mode (if mode is set to user ,differnce is of one week ,
   * and if mode is set to manager, date is startOf day).
   * @memberOf TimeAccountingManagementComponent
   */
  dateChange(event: any, action?: any) {
    if (action === undefined || action === '' || action === null) {
      if (this.isManagerMode) {
        this.historySearch.startDate = new Date(moment(event.value).format('YYYY-MM-DD'));
        this.historySearch.endDate = this.historySearch.startDate;
      } else {
        this.historySearch.startDate = moment(event.value).startOf('week');
        this.historySearch.endDate = moment(event.value).endOf('week');
      }
    } else if (action === 'Previous') {
      if (this.isManagerMode) {
        this.historySearch.startDate = new Date(moment(this.checkInOutUserForm.controls.startDate.value).subtract(1, 'days').format('YYYY-MM-DD'));
        this.historySearch.endDate = this.historySearch.startDate;
      } else {
        this.historySearch.startDate = moment(this.historySearch.startDate).subtract(7, 'days');
        this.historySearch.endDate = moment(this.historySearch.endDate).subtract(7, 'days');
      }
    } else if (action === 'Next') {
      if (this.isManagerMode) {
        this.historySearch.startDate = new Date(moment(this.checkInOutUserForm.controls.startDate.value).add(1, 'days').format('YYYY-MM-DD'));
        this.historySearch.endDate = this.historySearch.startDate;
      } else {
        this.historySearch.startDate = moment(this.historySearch.startDate).add(7, 'days');
        this.historySearch.endDate = moment(this.historySearch.endDate).add(7, 'days');
      }
    }
    if (moment(this.maxDate).format('YYYY-MM-DD') >= moment(this.historySearch.startDate).format('YYYY-MM-DD') &&
      moment(this.maxDate).format('YYYY-MM-DD') <= moment(this.historySearch.endDate).format('YYYY-MM-DD')) {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }
    let startdate = moment(this.historySearch.startDate).format('YYYY-MM-DD');
    let enddate = moment(this.historySearch.endDate).format('YYYY-MM-DD');
    this.checkInOutUserForm.controls.startDate.setValue(startdate);
    this.checkInOutUserForm.controls.endDate.setValue(enddate);
    const self = this;
    setTimeout(() => {
      self.cdrService.callDetectChanges(self.cdr);
    }, 100);
    this.getCheckInStatus();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall to check start date and end date difference more than a week or not
   * @memberOf TimeAccountingManagementComponent
   */
  public isMoreThenFourWeek(): any {
    const days = moment(this.historySearch.endDate).diff(moment(this.historySearch.startDate), 'days');
    if (days > 30) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall method to search the check in/out history of a particular user
   * @memberOf TimeAccountingManagementComponent
   */
  search(event) {
    this.historySearch.startDate = moment(this.historySearch.startDate);
    this.historySearch.endDate = moment(this.historySearch.endDate);
    this.cdrService.callDetectChanges(this.cdr);
    if (this.historySearch.startDate > this.historySearch.endDate) {
      this.messageService.showMessage("'End Date' should be greater than 'Start Date'", 'error');
    } else {
      this.getCheckInStatus();
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall method to change perspective according to mode (User mode or Manager mode)
   * @memberOf TimeAccountingManagementComponent
   */
  public setMode() {
    if (this.modeType == 'manager') {
      this.isManagerMode = true;
    } else {
      this.isManagerMode = false;
    }
    if (!this.isManagerMode) {
      this.checkInOutUserForm.get('participants').setValue([this.userDetails.id]);
      this.checkInOutUserForm.controls['participants'].disable();
    } else {
      //  this.timeAccountingDetails.setAvailableHistory(this.dataForPendingRequests);
      this.checkInOutUserForm.controls['participants'].enable();
      this.setDefaultForManager();
    }
    this.setDefaultDate();
    this.getCheckInStatus();
    const self = this;
    setTimeout(() => {
      self.cdrService.callDetectChanges(self.cdr);
    }, 100);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall method to reset the search screen and setting the values to it's defaults
   * @memberOf TimeAccountingManagementComponent
   */
  public setDefault() {
    this.disableNext = true;
    this.historySearch = { 'userId': [], chatInteract: 'user' };
    this.availableHistory = [];
    if (!this.isFromReminder) {
      this.availableHistory = [];
    }
    if (this.userDetails.id) {
      this.historySearch.userId = this.userDetails.id;
    }
    this.checkInOutUserForm.get('bandArray').setValue(this.options.chart.bandCount);
    if (this.isManagerMode) {
      // to set default value when mode is set to manager
      this.setDefaultForManager();
    }
    this.cdrService.callDetectChanges(this.cdr);
    this.setDefaultDate();
    this.getCheckInStatus();

  }


  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall method to set default date when mode is set to Manager
   * @memberOf TimeAccountingManagementComponent
   */
  public setDefaultForManager() {
    this.historySearch.userId = [];
    for (const obj of this.actualResponsiblePersonList) {
      if (obj.group == 'Sales - Atlanta' || obj.group == 'Sales - Rome' || obj.group == 'Sales - Commission Only' || obj.group == 'Support - US' ||
        obj.group == 'Marketing - US' || obj.group == 'Customer Relation') {
        if (obj.timeAccounting === true) {
          this.historySearch.userId.push(obj.id);
        }
      }
    }
    this.checkInOutUserForm.controls.participants.setValue(this.historySearch.userId);
  }

  public isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  };

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall call api to get data of checkIn/checkOut
   * @memberOf CheckinoutHistoryUserComponent
   */
  getCheckInStatus() {
    const self = this;
    if (!this.isManagerMode) {
      self.searchObject.startDate = moment(this.checkInOutUserForm.controls.startDate.value).format('YYYY-MM-DD HH:mm');
      self.searchObject.endDate = moment(this.checkInOutUserForm.controls.endDate.value).format('YYYY-MM-DD HH:mm');
    } else {
      self.searchObject.startDate = this.historySearch.startDate
      self.searchObject.endDate = this.historySearch.startDate
    }

    const tempUserId = this.checkInOutUserForm.controls.participants.value;
    self.searchObject.userId = [];
    self.searchObject.userId = tempUserId;
    self.searchObject.chatInteract = 'user'
    if (this.isFromReminder) {
      self.availableHistory = [];
      this.timeAccountingDetails.setAvailableHistory(this.dataForPendingRequests);
    }
    else {
      this.timeAccountingSrvice.getCheckInStatus(self.searchObject).then((response: any) => {
        if (response) {
          self.availableHistory = [];
          this.timeAccountingDetails.setAvailableHistory(response);
        }

      }, (error) => {
        console.error(error);
      });
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 03/03/2020
   * @discriptioncall call when event is emitted
   * @memberOf CheckinoutHistoryUserComponent
   */
  public getStatusData(data) {
    if (data) {
      let self = this;
      setTimeout(() => {
        if (self.isFromReminder) {
          self.updateReminderData.emit();
        } else {
          self.getCheckInStatus();
        }
      }, 0)
    }
  }

  ngOnInit() {
    this.initCalled = true;
    this.disableNext = true;
    this.userDetails = this.userService.getUserDetail();
    this.getLookupForHistorySearch();
    this.initCheckInOutUserForm();
    this.setDefaultDate();
    this.isTopManagementUser = this.userDetails.isTopManagementUser;
    this.isTimeAccountingManager = this.userDetails.isTimeAccountingManager;
    this.isManagement = this.userService.getProperty('isManagementUser');
    this.cdrService.callDetectChanges(this.cdr);
    if (this.userDetails.id) {
      this.historySearch.userId = this.userDetails.id;
    }
  }

  ngOnChanges(changes) {
    if (this.initCalled) {
      if (changes.dataForPendingRequests) {
        this.timeAccountingDetails.setAvailableHistory(this.dataForPendingRequests)
      }
    }
    this.setDefault();
  }

}

