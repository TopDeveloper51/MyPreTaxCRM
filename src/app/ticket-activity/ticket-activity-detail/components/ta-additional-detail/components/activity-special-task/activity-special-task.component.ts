// External imports
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import * as moment from 'moment-timezone';
import { FormGroup, FormBuilder, NgForm, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
// Internal imports
import { CDRService } from '@app/shared/services/cdr.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';

@Component({
  selector: 'mtpo-activity-special-task',
  templateUrl: './activity-special-task.component.html',
  styleUrls: ['./activity-special-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitySpecialTaskComponent implements OnInit, OnDestroy {

  @Input() modelData: any = {};
  public specialTaskForm: FormGroup;
  public type = 'date';
  public isShowSpacialTask = false;
  public isHideEndTime = false;
  public activitySpecialTaskOldData: any;
  public activityAvailable: boolean = true;

  private activitySpecialTaskSubscription: Subscription;

  public lookup: any;
  public activityData: any;
  public myDateValue: Date;
  public defaultFormValue = {};
  constructor(private fb: FormBuilder, private cdrService: CDRService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private cdr: ChangeDetectorRef) { }



  public initspecialTaskForm() {
    this.specialTaskForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      continues: '',
    });
    this.cdrService.callDetectChanges(this.cdr);
  }

  // reset value of Task End Time
  public resetTaskEndTime(): any {
    if (this.specialTaskForm.controls.continues.value === true) {
      this.specialTaskForm.controls.endDate.setValue('');
      this.specialTaskForm.controls.endDate.disable();
      this.isHideEndTime = true;
    } else {
      this.isHideEndTime = false;
      this.specialTaskForm.controls.endDate.enable();
    }
    const self = this;
    setTimeout(() => {
      self.cdrService.callDetectChanges(self.cdr);
    }, 100);
  }

  onDateChange() {
    const self = this;
    setTimeout(() => {
      self.cdrService.callDetectChanges(self.cdr);
    }, 100);
  }

  ngOnInit() {
    this.activitySpecialTaskSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.cdrService.callDetectChanges(this.cdr);
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          if (this.activityData.timePeriod) {
            this.specialTaskForm.controls.startDate.setValue(this.activityData.timePeriod.startDate);
            this.specialTaskForm.controls.endDate.setValue(this.activityData.timePeriod.endDate);
            this.specialTaskForm.controls.continues.setValue(this.activityData.timePeriod.continues);
            setTimeout(() => {
              this.cdrService.callDetectChanges(this.cdr);
            }, 100);
            if (this.specialTaskForm.controls.continues.value === true) {
              this.isHideEndTime = true;
            }
            this.defaultFormValue = {
              startDate: this.activityData.timePeriod.startDate,
              endDate: this.activityData.timePeriod.endDate,
              continues: this.activityData.timePeriod.continues,
            }
            this.activitySpecialTaskOldData = Object.assign({}, this.activitySpecialTaskOldData, this.specialTaskForm.value);
            this.cdr.detectChanges();
          }
        } else if (msgObj.topic === 'isShowSpacialTask') {
          this.isShowSpacialTask = msgObj.data;
          this.cdr.detectChanges();
        } else if (msgObj.topic == 'save') {
          let hasChanges = !_.isEqual(this.specialTaskForm.value, this.activitySpecialTaskOldData);
          if (this.isShowSpacialTask) {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-specialTask', topic: 'saveData', data: { 'isValid': this.specialTaskForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'timePeriod': this.specialTaskForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          } else {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-specialTask', topic: 'saveData', data: { 'isValid': true, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'timePeriod': this.specialTaskForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          }
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
      } else if (!this.activityData) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          if (this.activityData.timePeriod) {
            this.specialTaskForm.controls.startDate.setValue(this.activityData.timePeriod.startDate);
            this.specialTaskForm.controls.endDate.setValue(this.activityData.timePeriod.endDate);
            this.specialTaskForm.controls.continues.setValue(this.activityData.timePeriod.continues);
            if (this.specialTaskForm.controls.continues.value === true) {
              this.isHideEndTime = true;
            }
            this.defaultFormValue = {
              startDate: this.activityData.timePeriod.startDate,
              endDate: this.activityData.timePeriod.endDate,
              continues: this.activityData.timePeriod.continues,
            }
            this.activitySpecialTaskOldData = Object.assign({}, this.activitySpecialTaskOldData, this.specialTaskForm.value);
            const self = this;
            setTimeout(() => {
              self.cdrService.callDetectChanges(self.cdr);
            }, 100);
          }
        }
      }
    });
    this.initspecialTaskForm();
  }

  ngOnDestroy() {
    if (this.activitySpecialTaskSubscription) {
      this.activitySpecialTaskSubscription.unsubscribe();
    }
  }

}
