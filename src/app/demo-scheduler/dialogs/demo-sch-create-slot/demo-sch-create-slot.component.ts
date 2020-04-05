// External imports
import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

// Internal import 
import { MessageService } from '@app/shared/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DemoSchedulerService } from '@app/demo-scheduler/demo-scheduler.service';

@Component({
  selector: 'app-demo-sch-create-slot',
  templateUrl: './demo-sch-create-slot.component.html',
  styleUrls: ['./demo-sch-create-slot.component.scss']
})
export class DemoSchCreateSlotComponent implements OnInit {

  public demoSchedulerCreateSlotForm: FormGroup;
  public trainingPlanner: any = {};
  public isShowNoOfSlots = false;
  public data: any;
  public disableSave = false;
  public invalidTime = false;
  public purposeList = [];

  constructor(public fb: FormBuilder,
    public modal: NgbActiveModal,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private demoSchedulerservice: DemoSchedulerService) { }


  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to create slot form
   * @memberOf DemoSchCreateSlotComponent
   */
  initDemoSchedulerCreateSlotForm() {
    this.demoSchedulerCreateSlotForm = this.fb.group({
      slots: ['', [Validators.required]],
      time: ['', [Validators.required]],
      purpose: ''
    });
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to close dialog
   * @memberOf DemoSchCreateSlotComponent
   */
  close(): void {
    this.modal.close();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to check validation
   * @memberOf DemoSchCreateSlotComponent
   */
  checkValidation() {
    if (!(this.demoSchedulerCreateSlotForm.controls.slots.value > 0 && this.demoSchedulerCreateSlotForm.controls.slots.value < 7)) {
      this.disableSave = true;
    } else {
      this.disableSave = false;
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to check input validation
   * @memberOf DemoSchCreateSlotComponent
   */
  public isValidInput(event: any): boolean {
    if (event.keyCode > 48 && event.keyCode < 55) {
      return true;
    }
    return false;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to save changes of dialog and close
   * @memberOf DemoSchCreateSlotComponent
   */

  public save(): void {
    this.trainingPlanner.id = this.trainingPlanner.id;
    let tempDate = this.data.date + ' ' + moment(this.demoSchedulerCreateSlotForm.controls.time.value).format('HH:mm:ss');
    this.trainingPlanner.date = moment.tz(tempDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
    this.trainingPlanner.time = moment(this.trainingPlanner.date).utc().format('HH:mm');
    this.trainingPlanner.slots = this.demoSchedulerCreateSlotForm.controls.slots.value ? this.demoSchedulerCreateSlotForm.controls.slots.value : '';
    this.trainingPlanner.purpose = this.demoSchedulerCreateSlotForm.controls.purpose.value ? this.demoSchedulerCreateSlotForm.controls.purpose.value : '';

    this.demoSchedulerservice.createSlot(this.trainingPlanner).then(response => {
      this.modal.close(true);
      if (this.trainingPlanner.id) {
        this.messageService.showMessage('Slot timing changed successfully', 'success');
      } else {
        this.messageService.showMessage('Slot created successfully', 'success');
      }
    }, error => {
      console.error(error);
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-20202
   * @discription this mathod is called when form control value is changed
   * @memberOf DemoSchCreateSlotComponent
   */
  onChanges() {
    this.demoSchedulerCreateSlotForm.get('time').valueChanges.subscribe(val => {
      let tempDate = this.data.date + ' ' + moment(val).format('HH:mm:ss');
      this.trainingPlanner.date = moment.tz(tempDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      // this.demoSchedulerCreateSlotForm.controls.time.setValue(moment(this.trainingPlanner.date).utc().format('HH:mm'));
      let minTime = moment.tz(this.data.date + ' 08:00:00', 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      let maxTime = moment.tz(this.data.date + ' 20:00:00', 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      if (this.trainingPlanner.date < minTime) {
        this.messageService.showMessage('Slot Timings should not be lesser than 8 AM', 'error');
        this.invalidTime = true;
      } else if (this.trainingPlanner.date > maxTime) {
        this.messageService.showMessage('Slot Timings should not be greater than 8 PM', 'error');
        this.invalidTime = true;
      } else {
        this.invalidTime = false;
      }
    });
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @discription to format date
   * @memberOf DemoSchCreateSlotComponent
   */
  isDSTFormat() {
    if (this.data.slotDetails && this.data.slotDetails.id) {
      return moment.tz(this.data.date + ' ' + this.data.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').isDST()
    } else {
      return moment.tz(this.data.date + ' 08:00 AM', 'YYYY-MM-DD hh:mm A', 'America/New_York').isDST()
    }
  }

  ngOnInit() {
    this.purposeList = this.data.data.purposeList;
    this.data = this.data.data;
    this.initDemoSchedulerCreateSlotForm();
    if (this.data.slotDetails && this.data.slotDetails.id) {
      this.trainingPlanner.id = this.data.slotDetails.id;
      if (this.data.type !== 'createSlot') {
        this.demoSchedulerCreateSlotForm.controls.purpose.setValue(this.data.slotDetails.purpose);
      }
      let tempDate = moment.tz(this.data.date + ' ' + this.data.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
      if (this.isDSTFormat()) {
        this.demoSchedulerCreateSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 4, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      } else {
        this.demoSchedulerCreateSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 5, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      }
    } else {
      this.demoSchedulerCreateSlotForm.controls.purpose.setValue(['']);
      let tempDate = moment.tz(this.data.date + ' 08:00 AM', 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
      if (this.isDSTFormat()) {
        this.demoSchedulerCreateSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 4, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      } else {
        this.demoSchedulerCreateSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 5, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      }
      this.demoSchedulerCreateSlotForm.controls.slots.setValue(1);
    }
    this.onChanges();
  }

}
