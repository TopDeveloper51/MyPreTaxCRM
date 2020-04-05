// External imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

// Internal import 
import { MessageService, DialogService } from '@app/shared/services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DemoSchedulerService } from '@app/demo-scheduler/demo-scheduler.service';

@Component({
  selector: 'app-demo-sch-weekly-plan',
  templateUrl: './demo-sch-weekly-plan.component.html',
  styleUrls: ['./demo-sch-weekly-plan.component.scss']
})
export class DemoSchWeeklyPlanComponent implements OnInit {

  public demoSchedulerWeeklyPlanSlotForm: FormGroup;
  public weeklyPlanner: any = {};  // obj to store model value
  public lookup_week = [];  // store week lookup data
  public week;            // get week no of current month
  public startDate;      // get first day of week
  public endDate;        // get last day of week
  public _startDate;     // set first day of week
  public _endDate;       // set last day of week
  public endOfMonthDate;  // get end date of month

  constructor(public fb: FormBuilder,
    public modal: NgbActiveModal,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private demoSchedulerService: DemoSchedulerService,
    private dialogService: DialogService) { }


  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to create form
   * @memberOf DemoSchWeeklyPlanComponent
   */
  initDemoSchedulerWeeklyPlanSlotForm() {
    this.demoSchedulerWeeklyPlanSlotForm = this.fb.group({
      weekNo: '',
    });
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription method call when drop-down model value change
   * @memberOf DemoSchCreateSlotComponent
   */
  getDateRange() {
    if (this.weeklyPlanner.slots !== undefined) {
      this.getDateRanges(this.weeklyPlanner.slots);
    }
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription method call to check date range
   * @memberOf DemoSchCreateSlotComponent
   */
  getDateRanges(week) {
    let year = moment().year();
    let startDateOfWeek = moment().year(year).isoWeek(week).day("Sunday").utc().format();
    let endDateOfWeek = moment().year(year).isoWeek(week).day("Saturday").utc().format();
    let dateArray = [];
    while (endDateOfWeek >= startDateOfWeek) {
      dateArray.push(startDateOfWeek);
      startDateOfWeek = moment(startDateOfWeek).add(1, 'day').utc().format();
    }
    let _startRangeDate = dateArray[0];
    let _endRangeDate = dateArray[dateArray.length - 1];
    if (_startRangeDate) {
      this._startDate = moment(_startRangeDate).format('MM/DD/YYYY')
    }
    if (_endRangeDate) {
      this._endDate = moment(_endRangeDate).format('MM/DD/YYYY')
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription method call save dialog data and close
   * @memberOf DemoSchCreateSlotComponent
   */
  public save(): void {
    this.demoSchedulerService.createWeekPlan(this.demoSchedulerWeeklyPlanSlotForm.controls.weekNo.value).then((result) => {
      if (result) {
        this.messageService.showMessage('Weekly Plan Created Successfully', 'success');
        this.modal.close(this.demoSchedulerWeeklyPlanSlotForm.controls.weekNo.value);
      }
    }, (error) => {
      if (error && error.messageKey) {
        if (error.messageKey === 'Master Plan Already Exists For This Week') {

          const dialogData = {title: 'Weekly Planner already exists for given week', text: `For given week, There exists total ${error.data.totalSlot} slot(s), out of them ${error.data.bookedSlot} booked slot(s) found.
          \nClick OK to continue - which will create new slots without effecting existing slots. \nClick Cancel to discard.` };
          this.dialogService.confirm(dialogData, {}).result.then((result) => {
            if (result === "YES") {
              // call api to send for approval records
              this.demoSchedulerService.createWeekPlan(this.demoSchedulerWeeklyPlanSlotForm.controls.weekNo.value).then((result) => {
               
                  this.messageService.showMessage('Weekly Plan Created Successfully', 'success');
                  this.modal.close(this.demoSchedulerWeeklyPlanSlotForm.controls.weekNo.value);
               
              });
            }
          });
        }
        // this.messageService.showMessage({ 'type': 'error', 'message': error.messageKey, 'locale': 'FILTERADD_SUCCESS' });
      } else {
        console.error(error.messageKey);
       // this.messageService.showMessage('Master Plan Already Exists For This Week', 'error');
      }
    }
    );
  }

  close(): void {
    this.modal.close();
  }


  ngOnInit() {
    let year = moment().year();
    const weeks = (moment([year]).isoWeek(53).startOf('isoWeek').isoWeek() === 1) ? 52 : 53;
  
    for (let i = 1; i <= weeks; i++) {
      this.lookup_week.push({ id: i, name: i.toString() });   // set no.of weeks in lookup
    }
    this.initDemoSchedulerWeeklyPlanSlotForm();
    let date = moment().tz('America/New_York').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).utc().format('DD-MM-YYYY');
    this.weeklyPlanner.slots = moment(date, 'DD-MM-YYYY', 'America/New_York').isoWeek();
    this.getDateRange();
   
    this.demoSchedulerWeeklyPlanSlotForm.controls.weekNo.setValue(moment(date, 'DD-MM-YYYY', 'America/New_York').isoWeek());
    
  }

}

