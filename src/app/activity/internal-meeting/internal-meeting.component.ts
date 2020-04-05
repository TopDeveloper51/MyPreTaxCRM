import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonApiService, UserService, MessageService, CDRService } from '@app/shared/services'
import { APINAME } from '@app/activity/activity-constants';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from 'moment-timezone'
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-internal-meeting',
  templateUrl: './internal-meeting.component.html',
  styleUrls: ['./internal-meeting.component.scss']
})
export class InternalMeetingComponent implements OnInit {

  constructor(private _commonAPIService: CommonApiService,
    private userService: UserService,
    private messageService: MessageService,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder, ) {
    this.maxDate = new Date();
  }
  public maxDate: Date;
  public internalMeetingForm: FormGroup;
  public meetingData: any = { timePeriod: {} };
  public userDetails: any;
  public responsiblePersonList: any = [];
  public startTimeInEt;
  public endTimeInET;
  public internalMeetingLookup: any = {};
  public meetingSearchData: any = { 'userId': [] };
  public loadMeetingData: any = [];
  public disableNext: boolean = false;
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering

  /**
   * @author shreya kanani
   * @description this method define form controls
   */
  public initinternalMeetingForm() {
    this.internalMeetingForm = this.fb.group({
      participants: ['', Validators.required],
      subject: ['', Validators.required],
      date: ['', Validators.required],
      startTime: [''],
      endTime: ['']

    });
    this.internalMeetingForm.get('participants').setValue([this.userDetails.id]);
    this.cdr.detectChanges();
  }

  /**
  * @author Manali Joshi
  * @createdDate 10/1/2020
  * @param {*}  inputvalue
  * @memberof InternalMeetingComponent
  */
  filterData(eventTarget) {
    this.internalMeetingLookup.responsiblePersonList = this.rpLookupDataForFilter;
    this.internalMeetingLookup.responsiblePersonList = this.internalMeetingLookup.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.cdr.detectChanges();
  }

  /**
   * @author shreya kanani
   * @description this method call when date is changed
   */
  public onDateChange() {
    if (this.internalMeetingForm.controls.startTime.value !== undefined && this.internalMeetingForm.controls.startTime.value !== null && this.internalMeetingForm.controls.startTime.value != '') {
      let time = moment(this.internalMeetingForm.controls.startTime.value).format('hh:mm:ss A');
      let TempDate = moment(this.internalMeetingForm.controls.date.value).format('MM-DD-YYYY');
      let combineDate = TempDate + ' ' + time;
      this.startTimeInEt = moment(combineDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    }
    if (this.internalMeetingForm.controls.endTime.value !== undefined && this.internalMeetingForm.controls.endTime.value !== null && this.internalMeetingForm.controls.endTime.value != '') {
      let time = moment(this.internalMeetingForm.controls.endTime.value).format('hh:mm:ss A');
      let TempDate = moment(this.internalMeetingForm.controls.date.value).format('MM-DD-YYYY');
      let combineDate = TempDate + ' ' + time;
      this.endTimeInET = moment(combineDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      console.log(this.endTimeInET);
    }
  }

  /**
   * @author shreya kanani
   * @description this method call when start time is changed
   */
  onChangesStarttime(event: any) {
    if (event !== undefined && event !== null) {
      let time = moment(event).format('hh:mm:ss A');
      let TempDate;
      if (this.internalMeetingForm.controls.date.value == '') {
        TempDate = moment(this.maxDate).format('MM-DD-YYYY');
      } else {
        TempDate = moment(this.internalMeetingForm.controls.date.value).format('MM-DD-YYYY');
      }
      let combineDate = TempDate + ' ' + time;
      this.startTimeInEt = moment(combineDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    } else {
      this.startTimeInEt = '';
    }
    this.cdr.detectChanges();

  }

  /**
   * @author shreya kanani
   * @description this method call when end time is changed
   */
  onChangesEndtime(event: any) {
    if (event !== undefined && event !== null) {
      let time = moment(event).format('hh:mm:ss A');
      let TempDate;
      if (this.internalMeetingForm.controls.date.value == '') {
        TempDate = moment(this.maxDate).format('MM-DD-YYYY');
      } else {
        TempDate = moment(this.internalMeetingForm.controls.date.value).format('MM-DD-YYYY');
      }
      let combineDate = TempDate + ' ' + time;
      this.endTimeInET = moment(combineDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    }
    else {
      this.endTimeInET = '';
    }
    this.cdr.detectChanges();

  }

  /**
   * @author shreya kanani
   * @description this method call api for lookup value
   */
  public getLookUpForMeeting() {
    this._commonAPIService.getPromiseResponse({ apiName: APINAME.ORDERSCREEN_GETLOOKUP, isCachable: true }).then(response => {
      this.internalMeetingLookup.responsiblePersonList = response.responsiblePesronList;
      this.rpLookupDataForFilter = response.responsiblePesronList; // for group filter
      if (this.userDetails.id) {
        this.meetingData.responsiblePerson = [this.userDetails.id];
      }
    });
  }

  /**
   * @author shreya kanani
   * @description select all values 
   */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "participants":
        selected = [];
        selected = this.internalMeetingLookup.responsiblePersonList.map(
          item => item.id
        );
        this.internalMeetingForm.get("participants").patchValue(selected);
        break;

    }
  }

  /**
   * @author shreya kanani
   * @description clear all values
   */
  public onClearAll(clearSelectfor?: string) {
    this.internalMeetingLookup.responsiblePersonList = this.rpLookupDataForFilter;
    if (this.internalMeetingForm && clearSelectfor) {
      this.internalMeetingForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author shreya kanani
   * @description close on select
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author shreya kanani
   * @description this method create activity 
   */
  public createActivity() {
    if (this.internalMeetingForm.value.startTime !== undefined && this.internalMeetingForm.value.startTime !== null &&
      this.internalMeetingForm.value.startTime !== '' && this.internalMeetingForm.value.endTime !== undefined &&
      this.internalMeetingForm.value.endTime !== null && this.internalMeetingForm.value.endTime !== '') {
      let startTimeTemp = moment(this.internalMeetingForm.value.startTime);
      let endTimeTemp = moment(this.internalMeetingForm.value.endTime);

      if (startTimeTemp > endTimeTemp) {
        this.messageService.showMessage("'End Time' should be greater than 'Start Time'", 'error');
      } else {
        let tempStartTime = moment(startTimeTemp).format("hh:mm:ss A");
        let tempEndTime = moment(endTimeTemp).format("hh:mm:ss A");
        this.meetingData.timePeriod.startDate = moment(moment(this.internalMeetingForm.value.date).format('YYYY-MM-DD') + ' ' + tempStartTime);
        this.meetingData.timePeriod.endDate = moment(moment(this.internalMeetingForm.value.date).format('YYYY-MM-DD') + ' ' + tempEndTime);
        this.meetingData.subject = this.internalMeetingForm.value.subject;
        this.meetingData.responsiblePerson = this.internalMeetingForm.value.participants;
        this._commonAPIService.getPromiseResponse({ apiName: APINAME.CREATE_ACTIVITY_INTERNALMEETING, parameterObject: this.meetingData }).then(response => {
          if (response) {
            this.messageService.showMessage('Activity created successfully', 'success');
            // fill all fields with default value
            if (this.userDetails.id) {
              this.internalMeetingForm.get('participants').patchValue([this.userDetails.id]);
            }
            this.internalMeetingForm.patchValue({ 'subject': null });
            this.internalMeetingForm.get('date').patchValue('');
            this.internalMeetingForm.get('startTime').setValue(null);
            this.internalMeetingForm.get('endTime').setValue(null);
          }
        });
      }
    } else {
      this.messageService.showMessage('Please fill start Time and End Time', 'error');
    }

  }

  /**
   * @author shreya kanani
   * @description this method set deafult values
   */
  setDefault(): void {
    this.disableNext = true;
    this.meetingSearchData = { 'userId': [] };
    this.loadMeetingData = [];
    if (this.userDetails.id) {
      this.internalMeetingForm.get('participants').setValue([this.userDetails.id]);
    }
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.getLookUpForMeeting();
    this.initinternalMeetingForm();
    this.setDefault();
  }

}
