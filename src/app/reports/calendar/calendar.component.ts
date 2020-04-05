//External imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment-timezone';
import { SchedulerEvent, EventClickEvent } from '@progress/kendo-angular-scheduler';
import { Router } from '@angular/router';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
//Internal imports
import { CalendarService } from '@app/reports/calendar/calendar.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from '@app/shared/services/message.service';
import { UserService } from '@app/shared/services/user.service';
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})

export class CalendarComponent implements OnInit {
  @ViewChild('windowTitleBar', { static: false }) windowTitleBar: any;

  //private variables
  public schedulerData: any = []; // schedular data
  private criteriaForAppointment: any = { 'status': [] };
  private statuses: any = {}; // staus state variable
  private criteriaForAppointmentData: any = {}; // prepare request object
  private userDetails: any;
  //public variables
  public responsiblePersonList: any = []; // store responsible person value
  public displayDate;
  public selectedDate: Date; // display today date
  public events: SchedulerEvent[]; // schedule event variable
  public calendarForm: FormGroup; // form variable
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  //
  constructor(private calendarService: CalendarService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
    private userService: UserService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
  ) { }


  /**
    * @author Manali Joshi
    * @createdDate 10/1/2020
    * @param {*}  inputvalue
    * @memberof caledarComponent
    */
  filterData(eventTarget) {
    this.responsiblePersonList = this.rpLookupDataForFilter;
    this.responsiblePersonList = this.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
  }

  /**
* @author Satyam Jasoliya
* @createdDate 19/11/2019
* @discription get responsible person data
* @memberof caledarComponent
*/
  private getResposiblePersonListData() {
    this.calendarService.getResposiblePersonList().then((response: any) => {
      this.responsiblePersonList = response.responsiblePesronList;
      this.rpLookupDataForFilter = response.responsiblePesronList;
      if (this.userDetails.id) {
        this.criteriaForAppointment.responsiblePerson = [this.userDetails.id];
        this.criteriaForAppointment.startTime = undefined;
        this.criteriaForAppointment.endTime = undefined;
        this.getData(this.criteriaForAppointment);
      }
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription making form
  * @memberof caledarComponent
  */
  private calendarFormData() {
    this.calendarForm = this.fb.group({
      responsiblePersonResult: this.fb.control([this.userDetails.id], Validators.required),
      isTestCustomer: this.fb.control(false),
      appointmentStatus: this.fb.control(this.statuses.appointmentStatus),
      followupStatus: this.fb.control(this.statuses.followupStatus)
    });

  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription search get data functionality
  * @memberof caledarComponent
  */
  public getData(data?: any) {
    this.criteriaForAppointment.responsiblePersonId = this.calendarForm.get('responsiblePersonResult').value;
    this.criteriaForAppointment.isTestCustomer = this.calendarForm.get('isTestCustomer').value;
    this.criteriaForAppointment.startTime = moment(this.criteriaForAppointment.startTime).tz('America/New_York').startOf('day').format();
    this.criteriaForAppointment.endTime = moment(this.criteriaForAppointment.endTime).tz('America/New_York').endOf('day').format();
    this.criteriaForAppointmentData = {
      status: this.criteriaForAppointment.status,
      startTime: this.criteriaForAppointment.startTime,
      endTime: this.criteriaForAppointment.endTime,
      isTestCustomer: this.criteriaForAppointment.isTestCustomer,
      responsiblePerson: this.criteriaForAppointment.responsiblePersonId
    };
    this.localStorageUtilityService.addToLocalStorage('calendarFormData', this.calendarForm.value);
    if (this.calendarForm.get('appointmentStatus').value || this.calendarForm.get('followupStatus').value) {
      this.calendarService.getAppointmentListData(this.criteriaForAppointmentData).then((response) => {
        this.schedulerData = response;
        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        var currentDay = new Date().getDate();
        const parseAdjust = (eventDate: string): Date => {
          const date = new Date(eventDate);
          date.setFullYear(currentYear);
          return date;
        };
        this.displayDate = new Date(currentYear, currentMonth, currentDay);
        const calendarData = this.schedulerData.map(dataItem => (
          <SchedulerEvent>{
            id: dataItem.id,
            start: parseAdjust(moment(dataItem.plannedDateTime).tz('America/New_York').format('MM/DD/YYYY hh:mm A')),
            end: parseAdjust(moment(dataItem.plannedDateTime).tz('America/New_York').format('MM/DD/YYYY hh:mm A')),
            title: dataItem.subject,
          }
        ));
        this.events = calendarData;
      });
    }
    else {
      this.messageService.showMessage("'Please select either of the two statuses'", 'error')
    }
  }

  private checkLocalStorage(): void {
    if (this.localStorageUtilityService.checkLocalStorageKey('calendarFormData')) {
      this.calendarForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('calendarFormData'));
      this.getData();
    } else {
      if (this.calendarForm.get('appointmentStatus').value === undefined) {
        this.calendarForm.get('appointmentStatus').setValue(this.statuses.appointmentStatus);
      }
    }

  }
  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription status change in appointment status anf follow up status
  * @memberof caledarComponent
  */
  public statusChange() {
    this.criteriaForAppointment.status = [];
    if (this.calendarForm.get('appointmentStatus').value) {
      this.criteriaForAppointment.status.push('7');
    }
    if (this.calendarForm.get('followupStatus').value) {
      this.criteriaForAppointment.status.push('52');
    }

  }

  /**
    * @author Satyam Jasoliya
    * @createdDate 19/11/2019
    * @discription clear all data
    * @memberof caledarComponent
    */
  public clearAll(): void {
    this.responsiblePersonList = this.rpLookupDataForFilter;
    this.criteriaForAppointment = { 'status': [] }
    this.calendarForm.reset();
    this.calendarForm.get('isTestCustomer').setValue(false);
    if (this.localStorageUtilityService.checkLocalStorageKey('calendarFormData')) {
      this.localStorageUtilityService.removeFromLocalStorage('calendarFormData');
      this.calendarForm.get('isTestCustomer').setValue(false);
    }
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 19/11/2019
   * @discription dropdown clear data
   * @memberof caledarComponent
   */
  public onClearAll(clearSelectfor?: string): void {
    if (clearSelectfor && this.calendarForm) {
      this.calendarForm.get(clearSelectfor).patchValue([]);
    }
  }
  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription close select
  * @memberof caledarComponent
  */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription select all
  * @memberof caledarComponent
  */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'responsiblePerson':
        selected = [];
        selected = this.responsiblePersonList.map(
          item => item.id
        );
        this.calendarForm.get('responsiblePersonResult').patchValue(selected);
        break;
    }
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19/11/2019
  * @discription calendar date selection
  * @memberof caledarComponent
  */
  public navigateDate(navigateEvent: any): void {
    if (navigateEvent.action.type === "select-date" || navigateEvent.action.type === "next" || navigateEvent.action.type === "prev") {
      this.criteriaForAppointment.startTime = moment(navigateEvent.action.date).tz('America/New_York').format();;
      this.criteriaForAppointment.endTime = moment(navigateEvent.action.date).tz('America/New_York').format();
      this.getData(this.criteriaForAppointment);
    }
  }

  public onDateChange(event): void {
    if (event.dateRange) {
      this.criteriaForAppointment.startTime = moment(event.dateRange.start).tz('America/New_York').add(1, 'days').format();
      this.criteriaForAppointment.endTime = moment(event.dateRange.end).tz('America/New_York').format();
      this.getData(this.criteriaForAppointment);
    }
  }
  /**
  * @author Dhruvi shah
  * @createdDate 19/12/2019
  * @discription appointment specific cell click
  * @memberof caledarComponent
  */
  public cellClick(event): void {


    setTimeout(() => {
      let dialogData = { id: event.event.id, screen: 'activity', flag: true };
      this.ticketActivityOverlayService.openWindow(dialogData, undefined, this.windowTitleBar);
      // this.ticketActivityOverlayService.openWindow(event.event.id, 'activity', undefined, this.windowTitleBar);
    }, 0);


  }

  ngOnInit() {
    this.userDetails = this.userService.getUserDetail();
    this.getResposiblePersonListData();
    this.criteriaForAppointment.startTime = new Date(moment().utc().format('YYYY/MM/DD'));
    this.criteriaForAppointment.endTime = new Date(moment().utc().format('YYYY/MM/DD'));
    // this.criteriaForAppointment.isTestCustomer = false;
    // this.criteriaForAppointment.status = ['7'];
    this.statuses.appointmentStatus = true;
    this.statuses.followupStatus = false;
    this.calendarFormData();
    this.checkLocalStorage();
    this.statusChange();
  }
}
