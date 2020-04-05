// External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from "@ng-select/ng-select";
import * as moment from 'moment-timezone'

// Internal imports
import { UserService, MessageService, CDRService } from '@app/shared/services'
import { TimeAccountingService } from '@app/time-accounting/time-accounting.service';

@Component({
  selector: 'app-dtu-management',
  templateUrl: './dtu-management.component.html',
  styleUrls: ['./dtu-management.component.scss'],
  providers: [TimeAccountingService, NgbPopoverConfig],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DTUManagementComponent implements OnInit {

  dtuSearchForm: FormGroup; // form control for the search filters
  isManagerMode: boolean = false; // flag to identify which mode to show filters and result 
  userDetails: any; // object to store user's details
  lookup: any = { 'bandArr': [], 'userInteract': [], responsiblePersonList: [] };
  initialResponsiblePersonList: Array<any> = [];
  disableNext: boolean = false; // flag to disable the option of changing dates via 'Next' button
  showSummary: boolean = false;
  showResult: boolean = false;
  type = 'date';
  format: any = 'MM/dd/y';
  modeList: any = [{ id: 'user', name: 'User' }, { id: 'manager', name: 'Manager' }]
  modeType: string = 'user';
  maxDate: Date;
  dataArray: any = [];
  options: any = {
    data: [],
    chart: {
      chartType: 'stackedColumn',
      dataListField: 'timingData',
      YpropertyName: (this.isManagerMode ? 'UNAME' : 'DT'),
      XpropertyName: 'ST',
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
        // for mailsent
        {
          barColor: '#000000',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'mailSentData'
          }
        },
        // for mailsent
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
          barColor: '#FFC247',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'meeting'
          }
        },
        {
          barColor: '#FF5733',
          subJson: {
            startValueField: 'ST',
            endValueField: 'ET',
            dataCompareFiled: 'TYP',
            dataCompareValue: 'chat',
            isIntensity: true,
            intensityDataLabel: 'chatData',
            intensityConfiguration: {
              startValueField: 'ST',
              endValueField: 'ET',
              dataCompareFiled: 'INT'
            }
          }
        }
      ],
      showVerticalGrid: false,
      isBand: true,
      groupBy: 'TYP',
      bandCount: 5,
      bandSupported: ['chat'],
      priority: ['break', 'meeting', 'chat', 'phoneOut', 'pdSession', 'phoneIn', 'icons', 'CheckIn', 'CheckOut', 'mailSentData']
    },
    MinRange: null,
    MaxRange: null,
    yAxisType: (this.isManagerMode ? 'string' : 'date'),
    xAxisType: 'time',
    xMinRange: (this.isManagerMode ? '00:00' : '08:00'),
    xMaxRange: (this.isManagerMode ? '24:00' : '23:00'),
    xGap: {
      hour: 1,
    },
    labelOnXAxis: true,
    culture: 'en-US',
    canvasHeight: 600,
    lineColor: '#D3D3D3',
    Color: '#000',
    MinIndicators: 'assets/images/previous.png',
    MaxIndicators: 'assets/images/next.png'
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,
    private userService: UserService, private messageService: MessageService, private cdrService: CDRService,
    private timeAccountingSrvice: TimeAccountingService) {
    this.maxDate = new Date();
  }

  initDTUSearchForm() {

    this.dtuSearchForm = this.fb.group({
      userId: [undefined, Validators.required],
      startTime: '',
      endTime: '',
      break: [300],
      bandArray: [this.options.chart.bandCount, Validators.required],
      chatInteract: ['user', Validators.required],
      morningPreparationTime: 0,
      eveningWindDown: 0
    });
    this.setDefault();

    this.cdrService.callDetectChanges(this.cdr);
  }


  /**
   * @author Sheo Ouseph
   * @createdDate 04/03/2020
   * @discription clear dropdown values
   * @memberof TimeAccountingManagementComponent
   */
  public onClearAll(clearSelectfor?: string): void {
    if (clearSelectfor && this.dtuSearchForm) {
      this.dtuSearchForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author Sheo Ouseph
   * @createdDate 04/03/2020
   * @discription close on select
   * @memberof TimeAccountingManagementComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  /**
   * @author Sheo Ouseph
   * @createdDate 04/03/2020
   * @discription clear dropdown values
   * @memberof TimeAccountingManagementComponent
   */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'userId':
        selected = [];
        selected = this.lookup.responsiblePersonList.map(
          item => item.id
        );
        this.dtuSearchForm.get('userId').patchValue(selected);
        break;
    }
  }


  /**
   * @author Sheo Ouseph
   * @createdDate 03/03/2020
   * @param {*}  inputvalue
   * @memberof TimeAccountingManagementComponent
   */
  filterData(eventTarget) {
    this.lookup.responsiblePersonList = this.lookup.responsiblePersonList.filter(obj =>
      (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
    );
    this.cdr.detectChanges();
  }


  getLookup(): any {
    this.timeAccountingSrvice.getLookupForTimeAccounting().then((response: any) => {
      this.lookup = JSON.parse(JSON.stringify(response));
      // this.initialResponsiblePersonList = JSON.parse(JSON.stringify(response.responsiblePersonList));
      // this.lookup.responsiblePersonList = [];
      // for (const obj of response.responsiblePersonList) {
      //   const objname = this.lookup.responsiblePersonList.find((o) => { return obj.group === o.groupName; });
      //   if (objname !== undefined) {
      //     objname.group.push({ id: obj.id, name: obj.name });
      //   } else {
      //     this.lookup.responsiblePersonList.push({ id: obj.id, name: obj.name });
      //   }
      // }
      this.cdrService.callDetectChanges(this.cdr);

    }, (error) => {
      this.cdrService.callDetectChanges(this.cdr);
      console.error(error);
    });
  }

  dateChange(criteria?, action?) {

    if (criteria === 'Month') {
      if (action === 'Previous') {
        this.dtuSearchForm.get('startTime').setValue(moment(this.dtuSearchForm.get('startTime').value).subtract(2, 'week'));
        this.dtuSearchForm.get('endTime').setValue(moment(this.dtuSearchForm.get('startTime').value).add(13, 'days'));
      } else {
        this.dtuSearchForm.get('endTime').setValue(moment(this.dtuSearchForm.get('endTime').value).add(2, 'week'));
        this.dtuSearchForm.get('startTime').setValue(moment(this.dtuSearchForm.get('endTime').value).subtract(13, 'days'));
      }
    }

    if (criteria === 'Week') {
      if (action === 'Previous') {
        this.dtuSearchForm.get('startTime').setValue(moment(this.dtuSearchForm.get('startTime').value).subtract(1, 'week'));
      } else {
        this.dtuSearchForm.get('endTime').setValue(moment(this.dtuSearchForm.get('endTime').value).add(1, 'week'));
      }
    }

    if (criteria === 'Day') {
      if (action === 'Previous') {
        this.dtuSearchForm.get('startTime').setValue(moment(this.dtuSearchForm.get('startTime').value).subtract(1, 'days').format());
      } else if (action === 'Next') {
        this.dtuSearchForm.get('startTime').setValue(moment(this.dtuSearchForm.get('startTime').value).add(1, 'days').format());
      }
    }

    if (criteria === 'Month' || criteria === 'Week') {
      if (moment(this.maxDate).format('YYYY-MM-DD') >= moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') &&
        moment(this.maxDate).format('YYYY-MM-DD') <= moment(this.dtuSearchForm.value.endTime).format('YYYY-MM-DD')) {
        this.disableNext = true;
      } else {
        this.disableNext = false;
      }
    } else if (criteria === 'Day') {
      if (moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') >= moment(this.maxDate).subtract(1, 'days').format('YYYY-MM-DD')) {
        this.disableNext = true;
      } else {
        this.disableNext = false;
      }
    }

    //if (criteria) {
   // this.search();
    // }
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 0);
  }

  setMode() {
    if (this.modeType == 'manager') {
      this.isManagerMode = true;
    } else {
      this.isManagerMode = false;
    }
    this.options.chart.YpropertyName = (this.isManagerMode ? 'UNAME' : 'DT');
    this.options.yAxisType = (this.isManagerMode ? 'string' : 'date');
    this.options.xMinRange = (this.isManagerMode ? '00:00' : '08:00');
    this.options.xMaxRange = (this.isManagerMode ? '24:00' : '23:00');
    this.setDefault();
  }

  setDefault() {
    this.showResult = false;
    this.showSummary = false;
    this.dataArray = [];
    if (!this.isManagerMode) {
      this.dtuSearchForm.controls.userId.setValue(this.userDetails.id);
    } else {
      this.dtuSearchForm.controls['userId'].enable();
      this.setDefaultForManager();
      this.search();
    }
    this.setDefaultDate();
  }

  setDefaultForManager() {
    let userIds = [];
    for (const obj of this.lookup.responsiblePersonList) {
      if (obj.group == 'Sales - Atlanta' || obj.group == 'Sales - Rome' || obj.group == 'Customer Relation') {
        userIds.push(obj.id);
      }
    }
    this.dtuSearchForm.controls.userId.setValue(userIds);
  }

  setDefaultDate() {
    if (!this.isManagerMode) {
      this.dtuSearchForm.get('startTime').setValue(moment().add(-1, 'week').startOf('week'));
      this.dtuSearchForm.get('endTime').setValue(moment().endOf('week'));
      if (moment(this.maxDate).format('YYYY-MM-DD') >= moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') &&
        moment(this.maxDate).format('YYYY-MM-DD') <= moment(this.dtuSearchForm.value.endTime).format('YYYY-MM-DD')) {
        this.disableNext = true;
      } else {
        this.disableNext = false;
      }
    } else {
      this.dtuSearchForm.get('startTime').setValue(moment().add(-1, 'days').format());
      this.dtuSearchForm.get('endTime').setValue('');
      if (moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') >= moment(this.maxDate).subtract(1, 'days').format('YYYY-MM-DD')) {
        this.disableNext = true;
      } else {
        this.disableNext = false;
      }
    }
    //this.search();
    setTimeout(() => {
      this.cdrService.callDetectChanges(this.cdr);
    }, 0);
  }

  showSummaryDetail() {
    if (this.dataArray && this.dataArray.length !== 0 && this.showResult) {
      this.showSummary = !this.showSummary;
    }
  }

  isMoreThanSixMonths(): boolean {
    const months = moment(this.dtuSearchForm.get('endTime').value).diff(moment(this.dtuSearchForm.get('startTime').value), 'month');
    if (months >= 6) {
      return true;
    } else {
      return false;
    }
  }

  isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  search() {
    this.showResult = false;
    this.showSummary = false;
    this.dataArray = [];
    if (!this.isManagerMode) {

      if (this.dtuSearchForm.value.startTime > this.dtuSearchForm.value.endTime) {
        this.messageService.showMessage('End date should be greater than start date', 'error');
      } else {
        if (this.isMoreThanSixMonths()) {
          this.messageService.showMessage('Maximum date range allowed is 6 months, please change date range', 'error');
        } else {

          const searchDaily = JSON.parse(JSON.stringify(this.dtuSearchForm.value));

          if (this.dtuSearchForm.value.startTime) {
            searchDaily.startTime = moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(this.dtuSearchForm.value.startTime) ? '-04:00' : '-05:00');
          }
          if (this.dtuSearchForm.value.endTime !== undefined && this.dtuSearchForm.value.endTime !== null) {
            searchDaily.endTime = moment(this.dtuSearchForm.value.endTime).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(this.dtuSearchForm.value.endTime) ? '-04:00' : '-05:00');
          }

          this.timeAccountingSrvice.getDTUData(searchDaily, this.options, 'user').then((response: any) => {
            this.dataArray = JSON.parse(JSON.stringify(response));
            this.showResult = true;
            this.cdrService.callDetectChanges(this.cdr);
          }, (error) => {
            this.cdrService.callDetectChanges(this.cdr);
            console.error(error);
          });

        }
      }

    } else {

      const searchDaily = JSON.parse(JSON.stringify(this.dtuSearchForm.value));
      if (this.dtuSearchForm.value.startTime) {
        searchDaily.startTime = moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(this.dtuSearchForm.value.startTime) ? '-04:00' : '-05:00');
        searchDaily.endTime = moment(this.dtuSearchForm.value.startTime).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(this.dtuSearchForm.value.startTime) ? '-04:00' : '-05:00');
      }
      this.options.MinRange = this.dtuSearchForm.value.startTime;
      this.options.MaxRange = this.dtuSearchForm.value.startTime;
      this.timeAccountingSrvice.getDTUData(searchDaily, this.options, 'manager').then((response: any) => {
        this.dataArray = JSON.parse(JSON.stringify(response));
        this.options.date = this.dataArray.DT;
        this.showResult = true;
        this.cdrService.callDetectChanges(this.cdr);
      }, (error) => {
        this.cdrService.callDetectChanges(this.cdr);
        console.error(error);
      });

    }

  }

  ngOnInit(): void {
    this.userDetails = this.userService.getUserDetail();
    this.initDTUSearchForm();
    this.getLookup();
  }

}