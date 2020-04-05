// External imports
import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

// Internal import 
import { MessageService } from '@app/shared/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DailyViewService } from '@app/training-planner/daily-view/daily-view.service';

@Component({
  selector: 'app-create-slot',
  templateUrl: './create-slot.component.html',
  styleUrls: ['./create-slot.component.scss']
})
export class CreateSlotComponent implements OnInit {

  public createSlotForm: FormGroup;
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
    private dailyViewService: DailyViewService) { }


  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to create slot form
   * @memberOf CreateSlotComponent
   */
  initCreateSlotForm() {
    this.createSlotForm = this.fb.group({
      slots: ['', [Validators.required]],
      time: ['', [Validators.required]],
      purpose: ''
    });
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to close dialog
   * @memberOf CreateSlotComponent
   */
  close(): void {
    this.modal.close();
  }

  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to check validation
   * @memberOf CreateSlotComponent
   */
  checkValidation() {
    if (!(this.createSlotForm.controls.slots.value > 0 && this.createSlotForm.controls.slots.value < 7)) {
      this.disableSave = true;
    } else {
      this.disableSave = false;
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to check input validation
   * @memberOf CreateSlotComponent
   */
  public isValidInput(event: any): boolean {
    if (event.keyCode > 48 && event.keyCode < 55) {
      return true;
    }
    return false;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to save changes of dialog and close
   * @memberOf CreateSlotComponent
   */

  public save(): void {
    this.trainingPlanner.id = this.trainingPlanner.id;
    let tempDate = this.data.date + ' ' + moment(this.createSlotForm.controls.time.value).format('HH:mm:ss');
    this.trainingPlanner.date = moment.tz(tempDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
    this.trainingPlanner.time = moment(this.trainingPlanner.date).utc().format('HH:mm');
    this.trainingPlanner.slots = this.createSlotForm.controls.slots.value ? this.createSlotForm.controls.slots.value : '';
    this.trainingPlanner.purpose = this.createSlotForm.controls.purpose.value ? this.createSlotForm.controls.purpose.value : '';

    this.dailyViewService.createSlot(this.trainingPlanner).then(response => {
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
   * @createdDate 28-11-2019
   * @discription this mathod is called when form control value is changed
   * @memberOf CreateSlotComponent
   */
  onChanges() {
    this.createSlotForm.get('time').valueChanges.subscribe(val => {
      let tempDate = this.data.date + ' ' + moment(val).format('HH:mm:ss');
      this.trainingPlanner.date = moment.tz(tempDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      // this.createSlotForm.controls.time.setValue(moment(this.trainingPlanner.date).utc().format('HH:mm'));
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
   * @createdDate 28-11-2019
   * @discription to format date
   * @memberOf CreateSlotComponent
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
    this.initCreateSlotForm();
    if (this.data.slotDetails && this.data.slotDetails.id) {
      this.trainingPlanner.id = this.data.slotDetails.id;
      if (this.data.type !== 'createSlot') {
        this.createSlotForm.controls.purpose.setValue(this.data.slotDetails.purpose);
      }
      let tempDate = moment.tz(this.data.date + ' ' + this.data.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
      if (this.isDSTFormat()) {
        this.createSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 4, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      } else {
        this.createSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 5, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      }
    } else {
      this.createSlotForm.controls.purpose.setValue(['']);
      let tempDate = moment.tz(this.data.date + ' 08:00 AM', 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
      if (this.isDSTFormat()) {
        this.createSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 4, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      } else {
        this.createSlotForm.controls.time.setValue(moment(moment(tempDate).format()).subtract({ 'hours': 5, minutes: (moment(tempDate).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
      }
      this.createSlotForm.controls.slots.setValue(1);
    }
    this.onChanges();
  }

}
