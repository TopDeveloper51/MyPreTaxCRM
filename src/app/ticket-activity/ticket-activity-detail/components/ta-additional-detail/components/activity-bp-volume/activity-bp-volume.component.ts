// External Imports
import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

// Interanl Imports
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';

@Component({
  selector: 'mtpo-activity-bp-volume',
  templateUrl: './activity-bp-volume.component.html',
  styleUrls: ['./activity-bp-volume.component.scss'],
})
export class ActivityBpVolumeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() modelData: any = {};
  public lookup: any;
  public activityData: any;
  public bankProductForm: FormGroup;
  public tempBPVolumnDetails: any;
  private activityBankProductSubscription: Subscription;
  public isShowBankDetails = false;
  public defaultFormValue: any = {};
  public isShowAllElements: boolean = false;
  public activityBPOldData: any;
  public activityAvailable: boolean = true;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private ticketActivityIntegrityService: TicketActivityIntegrityService) { }

  /**
   * @author Mansi Makwana
   * @createdDate 06-11-2019
   * @description to create form
   * @memberof ActivityBpVolumeComponent
   */
  initbankProductForm() {
    this.bankProductForm = this.fb.group({
      year: [undefined, Validators.required],
      volume: '',
      unknown: '',
      bank: [undefined],
      NoBP: ''
    });
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi makwana
   * @createdDate 06-11-2019
   * @description blank value of Volume when unknown is true
   * @memberof ActivityBpVolumeComponent
   */

  public blankVolume(): any {
    if (this.bankProductForm.controls.unknown.value === true) {
      this.bankProductForm.controls.volume.setValue('');
      this.bankProductForm.controls['volume'].disable();

    } else {
      this.bankProductForm.controls['volume'].enable();
    }
    this.cdr.detectChanges();
  }

  public noBPCustomer() {
    if (this.bankProductForm.controls.NoBP.value === true) {
      this.isShowAllElements = false;
      this.activityData.BPVolumeDetails = {};
      this.bankProductForm.controls.year.disable();
      this.bankProductForm.controls.volume.disable();
      this.bankProductForm.controls.unknown.disable();
      this.bankProductForm.controls.bank.disable();

    } else {
      this.isShowAllElements = true;
      if (this.bankProductForm.controls.unknown.value === true) {
        this.bankProductForm.controls.volume.disable();
        this.bankProductForm.controls.year.enable();
        this.bankProductForm.controls.unknown.enable();
        this.bankProductForm.controls.bank.enable();
      } else {
        this.bankProductForm.controls.year.enable();
        this.bankProductForm.controls.volume.enable();
        this.bankProductForm.controls.unknown.enable();
        this.bankProductForm.controls.bank.enable();
        this.bankProductForm.get('year').setValidators([Validators.required]);
        this.bankProductForm.get('volume').setValidators([Validators.required]);
      }
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    // if (this.activityData.BPVolumeDetails !== undefined && this.activityData.BPVolumeDetails.volume !== undefined && this.activityData.BPVolumeDetails.volume === 'unknown') {
    //   this.bankProductForm.controls.unknown.setValue(true);
    // }

  }

  /**
   * @author Mansi Makwana
   * @createdDate 06-11-2019
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof ActivityBpVolumeComponent
   */
  public onClearAll(clearSelectfor) {
    this.bankProductForm.get(clearSelectfor).patchValue([]);
  }

  /**
   * @author Mansi Makwana
   * this function is select all Dropdown Data.
   * @memberof ActivityBpVolumeComponent
   */
  public onSelectAll() {
    let selected = [];
    selected = this.lookup.bankList.map(item => item.id);
    this.bankProductForm.get('bank').patchValue(selected);
  }


  setValue() {
    if (this.activityData.BPVolumeDetails) {
      if (this.activityData.BPVolumeDetails.NoBP === true) {
        this.bankProductForm.controls.NoBP.setValue(true);
        this.isShowAllElements = false;
        this.activityData.BPVolumeDetails = {};
        this.bankProductForm.controls.year.setErrors(null);
        this.bankProductForm.controls.volume.setErrors(null);
      } else if (this.activityData.BPVolumeDetails.unknown === true) {
        this.isShowAllElements = true;
        this.bankProductForm.get('year').setValidators([Validators.required]);
        this.bankProductForm.controls.volume.disable();
        this.bankProductForm.controls.year.enable();
        this.bankProductForm.controls.unknown.enable();
        this.bankProductForm.controls.bank.enable();
        this.bankProductForm.controls.NoBP.enable();
        this.bankProductForm.controls.year.setValue(this.activityData.BPVolumeDetails.year);
        this.bankProductForm.controls.unknown.setValue(this.activityData.BPVolumeDetails.unknown);
        this.bankProductForm.controls.volume.setValue(this.activityData.BPVolumeDetails.volume);
        this.bankProductForm.controls.bank.setValue(this.activityData.BPVolumeDetails.bank);
      } else {
        this.bankProductForm.get('year').setValidators([Validators.required]);
        this.bankProductForm.get('volume').setValidators([Validators.required]);
        this.isShowAllElements = true;
        this.bankProductForm.controls.year.enable();
        this.bankProductForm.controls.volume.enable();
        this.bankProductForm.controls.unknown.enable();
        this.bankProductForm.controls.bank.enable();
        this.bankProductForm.controls.NoBP.enable();
        this.bankProductForm.controls.year.setValue(this.activityData.BPVolumeDetails.year);
        this.bankProductForm.controls.volume.setValue(this.activityData.BPVolumeDetails.volume);
        this.bankProductForm.controls.bank.setValue(this.activityData.BPVolumeDetails.bank);
      }
      this.defaultFormValue = {
        year: this.activityData.BPVolumeDetails.year,
        volume: this.activityData.BPVolumeDetails.volume,
        unknown: this.activityData.BPVolumeDetails.unknown,
        bank: this.activityData.BPVolumeDetails.bank,
      }
    }
    this.activityBPOldData = Object.assign({}, this.bankProductForm.value);
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.activityBankProductSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.setValue();
        } else if (msgObj.topic === 'isShowBankDetails') {
          this.isShowBankDetails = msgObj.data;
          this.cdr.detectChanges();
        } else if (msgObj.topic === 'save') {
          let hasChanges = !_.isEqual(this.bankProductForm.value, this.activityBPOldData);
          if (this.isShowBankDetails) {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-bpVolume', topic: 'saveData', data: { 'isValid': this.bankProductForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'BPVolumeDetails': this.bankProductForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          } else {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-bpVolume', topic: 'saveData', data: { 'isValid': true, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'BPVolumeDetails': this.bankProductForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });

          }
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
      } else if (!this.activityData) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.setValue();
        }
      }
    });
    this.initbankProductForm();
  }

  ngOnDestroy() {
    if (this.activityBankProductSubscription) {
      this.activityBankProductSubscription.unsubscribe();
    }
  }

}
