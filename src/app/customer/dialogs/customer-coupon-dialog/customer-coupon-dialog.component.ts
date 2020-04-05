// External imports
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Internal imports
import { CommonApiService, MessageService } from '@app/shared/services';
import { APINAME } from '@app/customer/customer-constants';
import * as moment from 'moment-timezone';
import { CustomerService } from "@app/customer/customer.service";

@Component({
  selector: 'app-customer-coupon-dialog',
  templateUrl: './customer-coupon-dialog.component.html',
  styleUrls: ['./customer-coupon-dialog.component.scss']
})
export class CustomerCouponDialogComponent implements OnInit {

  @Input() data: any; // get data from dialog parent

  public couponForm: FormGroup;
  public packageTypeList: any = [];
  public couponData: any;
  showLoading: boolean;

  constructor(
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    private customerService: CustomerService
  ) { }

  /**
   * @author Dhruvi shah
   * @date 16/12/2019
   * @description added / updated coupon save
   * @memberof CustomerCouponDialogComponent
   */
  saveCoupon() {
    if (this.couponForm.valid) {
      let couponObj = JSON.parse(JSON.stringify(this.couponForm.value));
      for (const key in couponObj) {
        if (couponObj.hasOwnProperty(key) && (!couponObj[key])) {
          delete couponObj[key];
        }
      }
      if (couponObj.isNew) {
        delete couponObj.id;
        delete couponObj.source;
        delete couponObj.createdDate;
        delete couponObj.createdByName;
        delete couponObj.createdBy;
      }
      else {
        delete couponObj.isNew;
      }
      if (couponObj.validFrom > couponObj.validTo) {
        this.messageService.showMessage('Valid To date should be greater than valid from date', 'error');
      }
      else {
        couponObj.discountPrice = couponObj.discountPrice ? parseInt(couponObj.discountPrice) : undefined;
        if(couponObj.validFrom || couponObj.validTo){
        couponObj.validFrom = moment(couponObj.validFrom).utc().format();
        couponObj.validTo = moment(couponObj.validTo).utc().format();
        }
        // api call
        this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_COUPON, parameterObject: couponObj }).then(response => {
          this.modal.close(true);
          this.messageService.showMessage('Coupon saved successfully', 'success');
        });
      }
    }
  }
  public close() {
    this.modal.close();
    }
  /** 
   * @author Dhruvi shah
   * @date 16/12/2019
   * @description get lookup for packageTypeList
   * @memberof CustomerCouponDialogComponent
   */
  public getAllPackageType() {
    this.customerService.getSubscriptionPackageName(false).then(
      (response: any) => {
        this.packageTypeList = [];
        for (const obj of response.plans) {
          this.packageTypeList.push({ id: obj.code, name: obj.shortName });
        }
        this.showLoading = false;
      },
      error => {
        this.showLoading = false;
      }
    );
  };

  /**
   * @author Dhruvi shah
   * @date 16/12/2019
   * @memberof CustomerCouponDialogComponent
   */
  initCouponForm() {
    this.couponForm = this.fb.group({
      couponCode: [this.couponData && this.couponData.couponCode ? this.couponData.couponCode : ''], // [Validators.required, Validators.maxLength(10)]
      packageType: [this.couponData && this.couponData.packageType ? this.couponData.packageType : [], [Validators.required]],
      // packageType: [undefined, Validators.required],
      validFrom: [this.couponData && this.couponData.validFrom ? this.couponData.validFrom : ''],
      validTo: [this.couponData && this.couponData.validTo ? this.couponData.validTo : ''],
      discountPrice: [this.couponData && this.couponData.discountPrice ? this.couponData.discountPrice : '', [Validators.required]],
      isUsed: this.couponData && this.couponData.isUsed ? this.couponData.isUsed : false,
      customerId: this.couponData.customerId,
      // for add coupon
      isNew: this.couponData.isNew ? this.couponData.isNew : false,
      // for update coupon
      id: this.couponData.id ? this.couponData.id : '',
      source: this.couponData.source ? this.couponData.source : '',
      createdDate: this.couponData.createdDate ? this.couponData.createdDate : '',
      createdByName: this.couponData.createdByName ? this.couponData.createdByName : '',
      createdBy: this.couponData.createdBy ? this.couponData.createdBy : '',
    })
  }

  ngOnInit() {
    this.showLoading = true;
    this.couponData = this.data.couponObj;
    this.getAllPackageType();
    this.initCouponForm();
  }
}
