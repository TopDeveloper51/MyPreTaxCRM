// External Imports
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

// Internal Imports
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { CDRService } from '@app/shared/services/cdr.service';

@Component({
  selector: 'mtpo-activity-email',
  templateUrl: './activity-mail-detail.component.html',
  styleUrls: ['./activity-mail-detail.component.scss']
})
export class ActivityMailDetailComponent implements OnInit, OnDestroy {
  @Input() modelData: any = {};
  public activityData: any;
  public lookup: any;
  public mailDetailForm: FormGroup;
  private activityMailDetailSubscription: Subscription;
  public defaultFormValue = {};
  public dialerData: any = { makeCall: true };
  public emailRegEx: any = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
  public emailValid = {
    to: true,
    cc: true,
    bcc: true,
    from: true
  };
  public emailList: any = [];
  public activityMailOldData: any = {};
  public isEmailIn: boolean = false;
  public activityAvailable: boolean = true;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private cdrService: CDRService, private ticketActivityIntegrityService: TicketActivityIntegrityService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 11-11-2019
   * @description to create form
   * @memberof ActivityMailDetailComponent
   */

  initActivityMailDetailForm() {
    this.mailDetailForm = this.fb.group({
      from: this.fb.control(undefined),
      to: this.fb.control(null, [Validators.required, Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]),
      cc: this.fb.control(null, [Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]),
      bcc: this.fb.control(null, [Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]),
    });
    if (this.isEmailIn) {
      this.mailDetailForm.controls.to.disable();
      this.mailDetailForm.controls.cc.disable();
      this.mailDetailForm.controls.bcc.disable();
    }
    this.activityMailOldData = Object.assign(this.activityMailOldData, this.mailDetailForm.value);
  }

  /**
   * Used to validate the inputs of type 'email' activity
   * @param {*} checkType :string = 'to' || 'cc' || 'bcc' || 'from'
   * @returns {*}
   * @memberof CentricViewComponent
   */
  checkEmail(checkType: string): any {
    if (this.activityData) {
      if (this.activityData[checkType]) {
        this.emailValid[checkType] = true;
        if (this.activityData[checkType].indexOf(';') > 0) {
          const splitEmailAddress = this.activityData[checkType].split(';');
          for (let i = 0; i < splitEmailAddress.length; i++) {
            if (!this.emailRegEx.test(splitEmailAddress[i])) {
              this.emailValid[checkType] = false;
            }
          }
        } else {
          if (!this.emailRegEx.test(this.activityData[checkType])) {
            this.emailValid[checkType] = false;
          }
        }
      } else {
        this.emailValid[checkType] = true;
      }
    }
    this.cdrService.callDetectChanges(this.cdr);
  }

  setToFrom() {
    if (this.activityData && this.activityData.screen === 'email' && this.activityData.type === 'e-mail' && this.activityData.direction === 'out') {
      this.mailDetailForm.controls.from.setValidators(Validators.required);
      if (this.activityData && this.activityData.from) {
        const index = this.emailList.findIndex(obj => obj.id === this.activityData.from);
        if (index !== -1) {
          this.mailDetailForm.controls.from.setValue(this.emailList[index].id);
        } else {
          const index = this.emailList.findIndex(obj => obj.name === this.activityData.from.toLowerCase());
          if (index !== -1) {
          this.mailDetailForm.controls.from.setValue(this.emailList[index].id);
          }
        }
      } else {
        this.mailDetailForm.controls.from.setValidators(Validators.required);
      }
    } else if (this.activityData && this.activityData.screen === 'email' && this.activityData.type === 'e-mail' && this.activityData.direction === 'in') {
      this.mailDetailForm.controls.from.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]);
      if (this.activityData && this.activityData.from) {
        this.mailDetailForm.controls.from.setValue(this.activityData.from);
      }
    } else {
      this.mailDetailForm.controls.to.setErrors(null);
      this.mailDetailForm.controls.from.setErrors(null);
    }

    if (this.activityData) {
      if (this.activityData.to) {
        this.mailDetailForm.controls.to.setValue(this.activityData.to);
      } else if (this.activityData.bcc) {
        this.mailDetailForm.controls.bcc.setValue(this.activityData.bcc);
      } else if (this.activityData.cc) {
        this.mailDetailForm.controls.cc.setValue(this.activityData.cc);
      }
    }

    this.activityMailDetailSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if(msgObj.topic ==='activityDialogToEmail'){
        this.mailDetailForm.controls.to.setValue(msgObj.data);
       }
    });
    this.activityMailDetailSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if(msgObj.topic ==='emailToFollowUp'){
        this.mailDetailForm.controls.to.setValue(msgObj.data);
       }
    });
    this.activityMailOldData = Object.assign({}, this.activityMailOldData, JSON.parse(JSON.stringify(this.mailDetailForm.value)));
    this.cdr.detectChanges();
  }


  ngOnInit() {
    if (this.modelData && this.modelData.data && this.modelData.data.isEmailIn) {
      this.isEmailIn = true;
    } else {
      this.isEmailIn = false;
    }
    this.activityMailDetailSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.emailList = [];
        for (const obj of this.lookup.responsiblePersonList) {
          if (obj.email !== '') {
            this.emailList.push({ id: obj.id.toLowerCase(), name: obj.email.toLowerCase() });
          }
        }
        this.emailList = _.uniqBy(this.emailList, 'id');
        this.setToFrom();

      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.setToFrom();

        } else if (msgObj.topic == 'save') {
          let mailDetalvalue: any = {}
          let hasChanges = !_.isEqual(this.mailDetailForm.value, this.activityMailOldData);
          // to send from data in name ratger than id when from conreol is dropdown
          if (this.activityData && this.activityData.screen === 'email' && this.activityData.type === 'e-mail' && this.activityData.direction === 'out') {
            if (this.mailDetailForm.controls.from.value) {
              const detail = this.emailList.filter(obj => obj.id === this.mailDetailForm.controls.from.value);
              this.activityData.from = (detail && detail.length > 0 ? (detail[0].name) : '');
              mailDetalvalue = {
                from: this.activityData.from,
                to: this.mailDetailForm.controls.to.value,
                cc: this.mailDetailForm.controls.cc.value ? this.mailDetailForm.controls.cc.value : null,
                bcc: this.mailDetailForm.controls.bcc.value ? this.mailDetailForm.controls.bcc.value : null
              }
            }
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-mailDetails', topic: 'saveData', data: { 'isValid': this.mailDetailForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'activityMailDetails': mailDetalvalue, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          } else {
            this.mailDetailForm.controls.to.setErrors(null);
            this.mailDetailForm.controls.from.setErrors(null);
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-mailDetails', topic: 'saveData', data: { 'isValid': this.mailDetailForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'activityMailDetails': this.mailDetailForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          }

        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
      } else if (!this.activityData) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.cdr.detectChanges();
        }
      }
      
    });
    
    this.initActivityMailDetailForm();
  }

  ngOnDestroy() {
    if (this.activityMailDetailSubscription) {
      this.activityMailDetailSubscription.unsubscribe();
    }
  }

}
