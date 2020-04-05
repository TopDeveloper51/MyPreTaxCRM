import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonApiService, MessageService } from '@app/shared/services';
import { APINAME } from '@app/customer/customer-constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-customer-review-detail',
  templateUrl: './customer-review-detail.component.html',
  styleUrls: ['./customer-review-detail.component.scss']
})
export class CustomerReviewDetailComponent implements OnInit {


  @Input() data: any;

  public platformList: any = []; // store response of lookup api
  public mode: any;
  public reviewDetails: any;
  public customerReviewDetail: FormGroup;
  public createdDate: any;
  public updatedDate: any;
  public customerId: any;

  // used for rating's lookup
  public ratingList = [{ 'id': 1, 'name': 1 }, { 'id': 2, 'name': 2 }, { 'id': 3, 'name': 3 }, { 'id': 4, 'name': 4 }, { 'id': 5, 'name': 5 }];


  constructor(private commonAPIService: CommonApiService,
    private fb: FormBuilder,
    private messageService: MessageService,
    public modal: NgbActiveModal) { }

  public initCustomerActivitySearchForm() {
    this.customerReviewDetail = this.fb.group({
      platform: [this.data && this.data.data.platform ? this.data.data.platform : undefined,Validators.required],
      rating: [this.data && this.data.data.rating ? this.data.data.rating : undefined,Validators.required],
      feedback: [this.data && this.data.data.feedback ? this.data.data.feedback : '', Validators.required],
      custId: this.data.data.customerId,
      customerId: this.data.data.customerId,
      date: [this.data && this.data.data.date ? moment(this.data.data.date).tz('America/New_York').format('MM/DD/YY hh:mm') : undefined,Validators.required]
    })
  }


  public getLookUpForPlatforms() {
    this.commonAPIService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_PLATFORMS,isCachable:true }).then((result) => {
      this.platformList = result.platFormList;
    })
  }

  public save() {
    if (this.mode === "add") {
      this.commonAPIService.getPromiseResponse({ apiName: APINAME.SAVE_DATA_OF_CUSTOMER_REVIEW, parameterObject: this.customerReviewDetail.value }).then((result) => {
        this.messageService.showMessage('Review Added successfully', 'success');
        this.modal.close(true);
      });
    }
    else {
      let obj: any = {
        id: this.data.data.id,
        createdBy: this.data.data.createdBy,
        createdByName: this.data.data.createdByName,
        createdDate: this.data.data.createdDate,
        custId: this.data.data.custId,
        customerId: this.data.data.customerId,
        date: this.customerReviewDetail.get('date').value,
        feedback: this.customerReviewDetail.get('feedback').value,
        platform: this.customerReviewDetail.get('platform').value,
        rating: this.customerReviewDetail.get('rating').value,
        etDate: this.data.data.etDate,
        updatedBy: this.data.data.updatedBy,
        updatedByName: this.data.data.updatedByName,
        updatedDate: this.data.data.updatedDate,
      }
      this.commonAPIService.getPromiseResponse({ apiName: APINAME.SAVE_DATA_OF_CUSTOMER_REVIEW, parameterObject: obj }).then((result) => {
        this.messageService.showMessage('Review Updated successfully', 'success');
        this.modal.close(true);
      });
    }
  }


  ngOnInit() {
    this.getLookUpForPlatforms();
    this.initCustomerActivitySearchForm();
    this.createdDate = moment(this.data.data.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    if (this.data.data.updatedDate !== undefined && this.data.data.updatedDate !== null) {
      this.updatedDate = moment(this.data.data.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
    }
    if (this.data.data.id) {
      this.mode = 'edit';
    } else {
      this.mode = 'add';
    }
  }

}
