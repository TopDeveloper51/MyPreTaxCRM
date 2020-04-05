// External imports
import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Output, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

// Internal imports
import { CDRService } from '@app/shared/services/cdr.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';



@Component({
  selector: 'mtpo-activity-order-refund',
  templateUrl: './activity-order-refund.component.html',
  styleUrls: ['./activity-order-refund.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityOrderRefundComponent implements OnInit, OnDestroy {
  @Input() modelData: any = {};
  public lookup: any;
  public activityData: any;
  private activityOrderRefundSubscription: Subscription;
  public isShowOrderDetails = false;
  public defaultOrderFormValue: any = {};
  public activityOrderDetailsOldData: any;
  public activityAvailable: boolean = true;

  @Output() activityDataChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeTag: EventEmitter<any> = new EventEmitter();
  @ViewChild('formCentricActivityOrderRefund', { static: true }) formCentricActivityOrderRefund: NgForm;

  public orderRefundForm: FormGroup;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private cdrService: CDRService, private ticketActivityIntegrityService: TicketActivityIntegrityService) { }


  /**
   * @author Mansi makwana
   * @createdDate 06-11-2019
   * @description to create form
   * @memberof ActivityOrderRefundComponent
   */

  initOrderRefundForm() {
    this.orderRefundForm = this.fb.group({
      commissionMonth: [undefined, Validators.required],
      commissionYear: [undefined, Validators.required],
      transactionId: '',
      package: [undefined, Validators.required],
      saleType: [undefined, Validators.required],
      commissionReceiver: [undefined, Validators.required],
      orderPrice: [undefined, Validators.required],
      comment: ''
    });
    this.cdr.detectChanges();
  }


  /**
   * @author Mansi Makwana
   * @createdDate 06-11-2019
   * @description This method call when dropdown value is changed
   * @memberof ActivityOrderRefundComponent
   */
  public onChangeOfModel() {
    if (this.orderRefundForm.controls.saleType.value === 1 || this.orderRefundForm.controls.saleType.value === 4 || this.orderRefundForm.controls.saleType.value === 5 || this.orderRefundForm.controls.saleType.value === 6) {
      if ((this.activityData.tagList.findIndex(t => t.id === 6) === -1) && (this.activityData.tagList.findIndex(t => t.id === 1) > -1)) {
        let values = JSON.parse(JSON.stringify(this.activityData.tagList));
        values.push({ id: 6, name: "BPVolume", group: "order", isNewlyAdded: true })
        this.activityData.tagList = JSON.parse(JSON.stringify(values));
        this.changeTag.emit(this.activityData.tagList);
      }
    } else {
      if (this.activityData.tagList.findIndex(t => t.id == 6) > -1) {
        let values = JSON.parse(JSON.stringify(this.activityData.tagList));
        const isBPVolumeIndex = this.activityData.tagList.findIndex(t => t.id == 6 && t.isNewlyAdded == true);
        if (isBPVolumeIndex > -1) {
          values.splice(isBPVolumeIndex, 1);
        }
        this.activityData.tagList = JSON.parse(JSON.stringify(values));
        this.changeTag.emit(this.activityData.tagList);
      }
    }
    this.cdr.detectChanges();
  }

  /**
   * @author Mansi makwana
   * @createdDate 06-11-2019
   * @description function for Only positive Number allowed
   * @memberof ActivityOrderRefundComponent
   */

  public isPositiveNumber(event: any): any {
    if (event.keyCode === 45 || event.keyCode === 101 || event.keyCode === 43 || event.keyCode === 69) {
      return false;
    }
  }

  ngOnChange(): void {
    // done to make this field required
    if (this.activityData.orderDetails && isNaN(this.activityData.orderDetails.orderPrice)) {
      this.activityData.orderDetails.orderPrice = undefined;
    }
  }

  setValue() {
    if (this.activityData && this.activityData.orderDetails) {

      if (this.activityData.orderDetails.commissionMonth) {
        this.orderRefundForm.controls.commissionMonth.setValue(this.activityData.orderDetails.commissionMonth);
      }
      if (this.activityData.orderDetails.commissionYear) {
        this.orderRefundForm.controls.commissionYear.setValue(this.activityData.orderDetails.commissionYear);
      }
      if (this.activityData.orderDetails.transactionId) {
        this.orderRefundForm.controls.transactionId.setValue(this.activityData.orderDetails.transactionId);
      }
      if (this.activityData.orderDetails.package) {
        this.orderRefundForm.controls.package.setValue(this.activityData.orderDetails.package);
      }
      if (this.activityData.orderDetails.saleType) {
        this.orderRefundForm.controls.saleType.setValue(this.activityData.orderDetails.saleType);
      }
      if (this.activityData.orderDetails.commissionReceiver) {
        this.orderRefundForm.controls.commissionReceiver.setValue(this.activityData.orderDetails.commissionReceiver);
        // const index = this.lookup.responsiblePersonList.findIndex(obj => obj.name === this.activityData.orderDetails.commissionReceiver);
        //     if (index !== -1) {
        //       this.orderRefundForm.controls.commissionReceiver.setValue(this.activityData.orderDetails.commissionReceiver);
        //     } 

      }
      if (this.activityData.orderDetails.orderPrice) {
        this.orderRefundForm.controls.orderPrice.setValue(this.activityData.orderDetails.orderPrice);
      }
      if (this.activityData.orderDetails.comment) {
        this.orderRefundForm.controls.comment.setValue(this.activityData.orderDetails.comment);
      }
      // this.cdr.detectChanges();
      this.defaultOrderFormValue = {
        commissionMonth: this.activityData.orderDetails.commissionMonth,
        commissionYear: this.activityData.orderDetails.commissionYear,
        transactionId: this.activityData.orderDetails.transactionId,
        package: this.activityData.orderDetails.package,
        saleType: this.activityData.orderDetails.saleType,
        commissionReceiver: this.activityData.orderDetails.commissionReceiver,
        orderPrice: this.activityData.orderDetails.orderPrice,
        comment: this.activityData.orderDetails.comment,
      }
    }


    this.activityOrderDetailsOldData = Object.assign({}, this.activityOrderDetailsOldData, this.orderRefundForm.value);
    this.cdrService.callDetectChanges(this.cdr);
  }

  ngOnInit() {
    if(this.lookup && this.activityData && this.activityData.orderDetails){
      const index = this.lookup.responsiblePersonList.findIndex(obj => obj.name === this.activityData.orderDetails.commissionReceiver);
      if (index !== -1) {
        this.orderRefundForm.controls.commissionReceiver.setValue(this.lookup.responsiblePersonList[index].id);
      }
      this.cdr.detectChanges();
    }
    this.activityOrderRefundSubscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'lookup') {
        this.lookup = msgObj.data;
        this.cdr.detectChanges();
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic === 'activityData') {
          this.activityData = msgObj.data;
          this.setValue();
        } else if (msgObj.topic === 'isShowOrderDetails') {
          this.isShowOrderDetails = msgObj.data;
          this.cdr.detectChanges();
        } else if (msgObj.topic == 'save') {
          let hasChanges = !_.isEqual(this.orderRefundForm.value, this.activityOrderDetailsOldData);
          if (this.isShowOrderDetails) {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-order', topic: 'saveData', data: { 'isValid': this.orderRefundForm.valid, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'orderDetails': this.orderRefundForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          } else {
            this.ticketActivityIntegrityService.sendMessage({ channel: 'activity-order', topic: 'saveData', data: { 'isValid': true, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'orderDetails': this.orderRefundForm.value, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });

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

    this.initOrderRefundForm();
  }

  ngOnDestroy() {
    if (this.activityOrderRefundSubscription) {
      this.activityOrderRefundSubscription.unsubscribe();
    }
  }


}
