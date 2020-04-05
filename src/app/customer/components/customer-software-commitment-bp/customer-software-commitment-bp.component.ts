import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment-timezone';
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";


import { CDRService, MessageService, CommonApiService } from '@app/shared/services';
import { APINAME } from "@app/customer/customer-constants";
import { environment } from '@environments/environment';

@Component({
  selector: 'app-customer-software-commitment-bp',
  templateUrl: './customer-software-commitment-bp.component.html',
  styleUrls: ['./customer-software-commitment-bp.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSoftwareCommitmentBPComponent implements OnInit {

  @Input('customerID') customerID: string;
  @Input('responsiblePersonList') responsiblePersonList: Array<any>;
  public bpCommitmentForm: FormGroup;
  public invalidLinks: boolean = false;
  public BpCommitmentDetails: any = {};
  public isBPCustomer: boolean;
  public isBPCustomerDisplayText: string = '';
  public rpLookupDataForFilter = [];  // handle goup wise filtering this field holds all data for responsible person in which we are perform filtering
  public BPCountLookup = [
    { 'id': 50, 'name': '50' },
    { 'id': 100, 'name': '100' }];

  constructor(
    private messageService: MessageService,
    private commonApiService: CommonApiService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) { }


  /**
  * @author Manali Joshi
  * @createdDate 10/1/2020
  * @param {*}  inputvalue
  * @memberof CustomerSoftwareCommitmentBPComponent
  */
  filterData(eventTarget) {
    this.responsiblePersonList = this.rpLookupDataForFilter;
    this.responsiblePersonList = this.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   *
   *
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  public getBPCommitmentData(): void {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BPCOMMITMENTDETAILS_CUSTOMER, parameterObject: { customerId: this.customerID } }).then(response => {
      if (response) {
        this.BpCommitmentDetails = response;
        this.bpCommitmentForm.patchValue(response);
      } else {
        this.BpCommitmentDetails = {};
      }
      if (!this.BpCommitmentDetails.actRef || this.BpCommitmentDetails.actRef.length == 0) {
        this.BpCommitmentDetails.actRef = [{ 'link': '' }];
      } else {
        let activityReference = [];
        let linkToAppend = '';
        // if (environment.betaOnly) {
        //   linkToAppend = 'https://crm.advanced-taxsolutions.com/#/detail-view/activity/edit/'
        // } else {
        //   linkToAppend = 'https://betacrm.mytaxprepoffice.com/#/detail-view/activity/edit/'
        // }        
        linkToAppend = 'https://betacrm.mytaxprepoffice.com/#/detail-view/activity/edit/'
        for (let actRef of this.BpCommitmentDetails.actRef) {
          activityReference.push({ 'link': linkToAppend + actRef })
        }
        this.BpCommitmentDetails.actRef = activityReference;
        this.bpCommitmentForm.controls.actRef.setValue(this.BpCommitmentDetails.actRef);

      }

      if (this.BpCommitmentDetails.displayText) {
        if (this.BpCommitmentDetails.displayText == 'No BP Customer') {
          this.isBPCustomer = false;
        } else {
          this.isBPCustomer = true;
          this.isBPCustomerDisplayText = this.BpCommitmentDetails.displayText.split('Customer')[1];
        }
      }
    });
  }


  /**
   *
   *
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  public saveBPcommitmentDetails() {
    let commitmentDataObj = JSON.parse(JSON.stringify(this.bpCommitmentForm.value));

    if (commitmentDataObj.date) {
      commitmentDataObj.date = moment(commitmentDataObj.date).utc().format();
    }
    if (commitmentDataObj.actRef && commitmentDataObj.actRef.length > 0) {
      commitmentDataObj.actRef = commitmentDataObj.actRef.map(function (o) { return o.link; });
      for (let actReference in commitmentDataObj.actRef) {
        commitmentDataObj.actRef[actReference] = commitmentDataObj.actRef[actReference].split('edit/')[1];
      }
    }
    commitmentDataObj.actRef = commitmentDataObj.actRef.filter(function (el) {
      return el;
    });

    const responsibleCurrentIndex = this.responsiblePersonList.findIndex(t => t.id == commitmentDataObj.commitmentBy);
    if (responsibleCurrentIndex !== -1) {
      commitmentDataObj.commitmentBy_Name = this.responsiblePersonList[responsibleCurrentIndex].name;
    }
    this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_BPCOMMITMENTDETAILS_CUSTOMER, parameterObject: commitmentDataObj }).then(response => {
      if (response) {
        this.messageService.showMessage('BP Commitment details saved successfully', 'success');
      }
    });
  }


  /**
   *
   *
   * @param {*} index
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  removeActivityReference(index) {
    (this.bpCommitmentForm.controls.actRef as FormArray).removeAt(index);
  }

  /**
   *
   *
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  addActivityReference() {
    const control = this.fb.group({
      link: ['', Validators.pattern('^(https:\/\/betacrm\.mytaxprepoffice\.com\/#\/detail-view\/.*[a-z]\/edit\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$')]
    });
    (this.bpCommitmentForm.controls.actRef as FormArray).push(control);
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   *
   *
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  addActivityReferenceInForm() {
    if (this.BpCommitmentDetails.actRef && this.BpCommitmentDetails.actRef.length > 0) {
      this.BpCommitmentDetails.actRef.forEach((element) => {
        const control = this.fb.group({
          link: element && element.link ? [element.link, Validators.pattern('^(https:\/\/betacrm\.mytaxprepoffice\.com\/#\/detail-view\/.*[a-z]\/edit\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$')] : ['', Validators.pattern('^(https:\/\/betacrm\.mytaxprepoffice\.com\/#\/detail-view\/.*[a-z]\/edit\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$')],
        });
        (this.bpCommitmentForm.controls.actRef as FormArray).push(control);
        this.CDRService.callDetectChanges(this.cdr);
      })
    } else {
      this.addActivityReference();
    }

  }
  onDateChange() {
    setTimeout(() => {
      this.CDRService.callDetectChanges(this.cdr);
    }, 100);
  }

  /**
   *
   *
   * @memberof CustomerSoftwareCommitmentBPComponent
   */
  initBPCommitmenForm() {
    this.bpCommitmentForm = this.fb.group({
      noBPCommitment: this.fb.control(this.BpCommitmentDetails && this.BpCommitmentDetails.noBPCommitment ? this.BpCommitmentDetails.noBPCommitment : false),
      date: this.fb.control(this.BpCommitmentDetails && this.BpCommitmentDetails.date ?
        this.BpCommitmentDetails.date
        : '', [Validators.required]),
      comment: this.fb.control(this.BpCommitmentDetails && this.BpCommitmentDetails.comment ? this.BpCommitmentDetails.comment : ''),
      commitmentBy: this.fb.control(this.BpCommitmentDetails && this.BpCommitmentDetails.commitmentBy ? this.BpCommitmentDetails.commitmentBy : [], [Validators.required]),
      BPCountCommited: this.fb.control(this.BpCommitmentDetails && this.BpCommitmentDetails.BPCountCommited ? this.BpCommitmentDetails.BPCountCommited : null, [Validators.required]),
      customerId: this.fb.control(this.customerID),
      displayText: this.fb.control(this.BpCommitmentDetails.displayText),
      createdDate: this.fb.control(this.BpCommitmentDetails.createdDate),
      updatedDate: this.fb.control(this.BpCommitmentDetails.updatedDate),
      createdBy: this.fb.control(this.BpCommitmentDetails.createdBy),
      updatedBy: this.fb.control(this.BpCommitmentDetails.updatedBy),
      actRef: new FormArray([]),
    })
    this.onDateChange();
    this.addActivityReferenceInForm();
    this.CDRService.callDetectChanges(this.cdr);

  }

  ngOnChanges(): void {
    this.initBPCommitmenForm();
    this.rpLookupDataForFilter = this.responsiblePersonList; // for group filter
  }

  ngOnInit() {
    this.getBPCommitmentData(); // get data for bp
    this.initBPCommitmenForm(); // create form
    this.rpLookupDataForFilter = this.responsiblePersonList; // for group filter
  }


}
