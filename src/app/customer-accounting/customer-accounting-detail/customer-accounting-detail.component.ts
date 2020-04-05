// External imports
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from 'moment-timezone';
// Internal imports
import { CustomerAccountingDetailService } from '@app/customer-accounting/customer-accounting-detail/customer-accounting-detail.service';
import { CopyToClipboardService } from "@app/shared/services/copy-clipboard.service";
import { DialogService } from '@app/shared/services/dialog.service';
import { CustomerAccountingHistoryComponent } from '@app/customer-accounting/dialogs/customer-accounting-history/customer-accounting-history.component';
import { ChangeCustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/change-customer/change-customer.component';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-customer-accounting-detail',
  templateUrl: './customer-accounting-detail.component.html',
  styleUrls: ['./customer-accounting-detail.component.scss'],
  providers: [CustomerAccountingDetailService]
})

export class CustomerAccountingDetailComponent implements OnInit {
  //public variable
  public data: any;
  public mode: string;
  public length: any;
  public index: any;
  public createdDate: any;
  public updatedDate: any;
  public datetime: any;
  public initialPaymentDetails: any = {};
  public availablePayment: any = [];
  public processorListForEnablingEditing = [{ id: "Check", name: "Check" }, { id: "Credit Note", name: "Credit Note" }, { id: "Invoice", name: "Invoice" }, { id: "PaymentIn Internal", name: "PaymentIn Internal" }]
  public modeList: any = [{ id: 'edit', name: 'Edit' }, { id: 'view', name: 'View' }];
  public idNextPrev: any = [];
  public currentCustomerIndex: any;
  public customerId;
  public customerDataFromLedger: any;
  public paymentDetails: any = {};
  public customerAccountingDetailForm: FormGroup;
  public paymentInvoiceAccountingDetailForm: FormGroup;
  public checkStatusList: any = [{ id: 'Issued', name: 'Issued' }, { id: 'Cleared', name: 'Cleared' }, { id: 'Cancelled', name: 'Cancelled' }];
  public checkTypeList: any = [{ id: 'Check-In', name: 'Check-In' }, { id: 'Check-Out', name: 'Check-Out' }];

  constructor(private model: NgbActiveModal,
    private fb: FormBuilder,
    private customerAccountingDetailService: CustomerAccountingDetailService,
    private copyToClipboardService: CopyToClipboardService,
    private dialogService: DialogService,
    private userService: UserService) { }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description customer accounting detail form field
* @memberof CustomerAccountingDetailComponent
*/
  public initCustomerAccountingDetailForm() {
    this.customerAccountingDetailForm = this.fb.group({
      taxSeason: this.fb.control(undefined),
      offer: this.fb.control(undefined),
      transactionId: this.fb.control('', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      datetime: this.fb.control('', [Validators.required]),
      grossAmount: this.fb.control('', [Validators.required]),
      checkIssueDate: this.fb.control(''),
      type: this.fb.control(this.checkTypeList[0].id, [Validators.required]),
      status: this.fb.control(undefined),
      checkClearingDate: this.fb.control(''),
      comment: this.fb.control('')
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description payment invoice customer accounting form field
* @memberof CustomerAccountingDetailComponent
*/
  public paymentInvoiceCustomerAccountingDetailForm() {
    this.paymentInvoiceAccountingDetailForm = this.fb.group({
      taxSeason: this.fb.control(undefined),
      offer: this.fb.control(undefined),
      datetime: this.fb.control('', [Validators.required]),
      grossAmount: this.fb.control('', [Validators.required]),
      comment: this.fb.control('')
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description add and edit function
* @memberof CustomerAccountingDetailComponent
*/
  public save() {
    // mode new and edit condition
    if (this.mode === 'new') {
      if (this.paymentDetails.processor == 'Credit Note' || this.paymentDetails.processor == 'Invoice' || this.paymentDetails.processor == 'PaymentIn Internal') {
        this.paymentDetails = this.paymentInvoiceAccountingDetailForm.value;
        this.paymentDetails.source = 'Internal';
        this.paymentDetails.type = this.data.transactionType;
        this.paymentDetails.processor = this.data.transactionType;
        this.paymentDetails.datetime = moment(this.paymentInvoiceAccountingDetailForm.get('datetime').value).utc().format();
        if (this.paymentDetails.processor == 'Credit Note' || this.paymentDetails.processor == 'Invoice') {
          this.paymentDetails.status = 'Sent';
        } else {
          this.paymentDetails.status = 'Completed';
        }
      }
      else {
        this.paymentDetails = this.customerAccountingDetailForm.value;
        this.paymentDetails.datetime = moment(this.customerAccountingDetailForm.get('datetime').value).utc().format();
        this.paymentDetails.source = 'Check';
        if (this.data.transactionType == 'Check-In' || this.data.transactionType == 'Check-Out') {
          this.paymentDetails.processor = 'Check';
        }
        else {
          this.paymentDetails.processor = this.data.transactionType;
        }
      }
      this.paymentDetails.applicableTo = 'customer';
      this.paymentDetails.netAmount = this.paymentDetails.grossAmount;
      this.paymentDetails.customerIdentificationSource = 'manual';
      if (this.customerDataFromLedger) {
        this.paymentDetails.customerId = this.customerDataFromLedger.customerId;
        this.paymentDetails.customerNumber = this.customerDataFromLedger.customerNumber;
      }
    }
    else {
      // mode view edit case
      if (this.paymentDetails && this.mode === 'view') {
        this.paymentDetails.taxSeason = this.paymentInvoiceAccountingDetailForm.get('taxSeason').value;
        this.paymentDetails.offer = this.paymentInvoiceAccountingDetailForm.get('offer').value;
        this.paymentDetails.comment = this.paymentInvoiceAccountingDetailForm.get('comment').value;
        if (this.paymentDetails.type == 'Check-In' || this.paymentDetails.type == 'Check-Out') {
          this.paymentDetails.processor = 'Check';
        }
        else {
          this.paymentDetails.processor = this.paymentDetails.type;
        }
      }
      // mode edit case and processor check in check out
      if (this.paymentDetails && this.mode === 'edit' && this.paymentDetails.processor === 'Check') {
        this.paymentDetails.taxSeason = this.customerAccountingDetailForm.get('taxSeason').value;
        this.paymentDetails.offer = this.customerAccountingDetailForm.get('offer').value;
        this.paymentDetails.transactionId = this.customerAccountingDetailForm.get('transactionId').value;
        this.paymentDetails.name = this.customerAccountingDetailForm.get('name').value;
        this.paymentDetails.datetime = this.customerAccountingDetailForm.get('datetime').value;
        this.paymentDetails.grossAmount = this.customerAccountingDetailForm.get('grossAmount').value;
        this.paymentDetails.checkIssueDate = this.customerAccountingDetailForm.get('checkIssueDate').value;
        this.paymentDetails.type = this.customerAccountingDetailForm.get('type').value;
        this.paymentDetails.status = this.customerAccountingDetailForm.get('status').value;
        this.paymentDetails.checkClearingDate = this.customerAccountingDetailForm.get('checkClearingDate').value;
        this.paymentDetails.comment = this.customerAccountingDetailForm.get('comment').value;
        if (this.paymentDetails.type == 'Check-In' || this.paymentDetails.type == 'Check-Out') {
          this.paymentDetails.processor = 'Check';
        }
        else {
          this.paymentDetails.processor = this.paymentDetails.type;
        }
      }
      // mode edit case and processor invoice,credit note & payment in interval 
      if (this.paymentDetails && this.mode === 'edit' && this.paymentDetails.processor !== 'Check') {
        this.paymentDetails.taxSeason = this.paymentInvoiceAccountingDetailForm.get('taxSeason').value;
        this.paymentDetails.offer = this.paymentInvoiceAccountingDetailForm.get('offer').value;
        this.paymentDetails.datetime = this.paymentInvoiceAccountingDetailForm.get('datetime').value;
        this.paymentDetails.grossAmount = this.paymentInvoiceAccountingDetailForm.get('grossAmount').value;
        this.paymentDetails.comment = this.paymentInvoiceAccountingDetailForm.get('comment').value;
        if (this.paymentDetails.type == 'Check-In' || this.paymentDetails.type == 'Check-Out') {
          this.paymentDetails.processor = 'Check';
        }
        else {
          this.paymentDetails.processor = this.paymentDetails.type;
        }
      }

      if (this.paymentDetails.processor == 'PaymentIn Internal') {
        this.paymentDetails.source = 'Internal';
        this.paymentDetails.type = this.paymentDetails.processor;
        this.paymentDetails.status = 'Completed';
      }
    }

    if (this.paymentDetails.offer && this.data.lookup.licenseOfferType && this.data.lookup.licenseOfferType.length > 0) {
      let obj = this.data.lookup.licenseOfferType.find(t => t.id === this.paymentDetails.offer);
      this.paymentDetails.offerName = obj.name;
    }

    this.customerAccountingDetailService.saveNewTransactionDetails(this.paymentDetails).then((response: any) => {
      this.model.close(true);
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description check processor type
* @memberof CustomerAccountingDetailComponent
*/
  public checkProcessorType() {
    if (this.processorListForEnablingEditing.findIndex(t => t.id == this.paymentDetails.processor) > -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 20-03-2020
 * @description get customer accounting history dialog
 * @memberof CustomerAccountingDetailComponent
 */
  public getCustomerAccHistory() {
    this.dialogService.custom(CustomerAccountingHistoryComponent, { paymentHistory: this.paymentDetails.history }, { keyboard: true, backdrop: true, size: 'xl' }).result.then((result) => {
    });
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description reference transaction id copy function
* @memberof CustomerAccountingDetailComponent
*/
  public toClipboard() {
    this.copyToClipboardService.copy(this.paymentDetails.refTransactionId);
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description go to customer card 
* @memberof CustomerAccountingDetailComponent
*/
  public goToCustomerCard(): void {
    window.open('/#/customer/edit/' + this.paymentDetails.customerId, '_blank');
  };

  /**
  * @author Satyam Jasoliya
  * @createdDate 20-03-2020
  * @description add change customer reference dialog method
  * @memberof CustomerAccountingDetailComponent
  */
  public addChangeCustomerRef() {
    let type = this.paymentDetails.customerId && this.mode !== 'new' ? 'Change Customer Reference' : 'Add Customer Reference';
    this.dialogService.custom(ChangeCustomerComponent, { 'title': 'Customer Search', 'type': type, 'disableRemove': true }, { keyboard: true, backdrop: true, size: 'xl' }).result.then((result) => {
      if (result && this.mode == 'new') {
        this.paymentDetails.customerId = result[0].customerID;
        this.paymentDetails.customerNumber = result[0].customerNumber;
      } else {
        let jsonToPass = {
          'paymentDocId': (typeof this.paymentDetails.id == 'string') ? parseInt(this.paymentDetails.id) : this.paymentDetails.id,
          'customerId': result[0].customerID,
          'updatedBy': this.userService.getUserDetail().id
        }
        this.customerAccountingDetailService.addChangeCustomerReference(jsonToPass).then(response => {
          this.getPaymentDoc({ 'id': this.paymentDetails.id }, 'changeCustomerReference');
        });
      }
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 20-03-2020
  * @description get payment document fill data method 
  * @memberof CustomerAccountingDetailComponent
  */
  public getPaymentDoc(id: any, from?) {
    const self = this;
    this.customerAccountingDetailService.getCustomerTransactionDetailsById(id).then(response => {
      self.paymentDetails = response;
      if (this.data.selectedRow.type && this.mode === 'view' && from === 'firstTimeClickRowData' || this.data.selectedRow.type && this.mode === 'view' && from === 'changeCustomerReference') {
        this.paymentInvoiceAccountingDetailForm.get('taxSeason').setValue(this.data.selectedRow.taxSeason);
        this.paymentInvoiceAccountingDetailForm.get('offer').setValue(this.data.selectedRow.offer);
        this.paymentInvoiceAccountingDetailForm.get('comment').setValue(this.data.selectedRow.comment);
      }
      else {
        this.paymentInvoiceAccountingDetailForm.get('taxSeason').setValue(id.taxSeason);
        this.paymentInvoiceAccountingDetailForm.get('offer').setValue(id.offer);
        this.paymentInvoiceAccountingDetailForm.get('comment').setValue(id.comment);
      }
      if (this.mode == 'edit') {
        if (self.paymentDetails.processor !== 'Check' && self.paymentDetails.type !== 'Credit Note' && self.paymentDetails.type !== 'Invoice' && self.paymentDetails.type !== 'PaymentIn Internal') {
          this.mode = 'view';
        }
      }
      if (self.paymentDetails.datetime !== undefined && self.paymentDetails.datetime !== '') {
        self.datetime = moment(self.paymentDetails.datetime).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }
      if (self.paymentDetails.createdDate !== undefined && self.paymentDetails.createdDate !== '') {
        self.createdDate = moment(self.paymentDetails.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }
      if (self.paymentDetails.updatedDate !== undefined && self.paymentDetails.updatedDate !== '') {
        self.updatedDate = moment(self.paymentDetails.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }
      setTimeout(() => {
        self.initialPaymentDetails = JSON.parse(JSON.stringify((self.paymentDetails)));
      }, 500);
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 20-03-2020
  * @description this function is use to set mode (view,edit,add) 
  * @memberof CustomerAccountingDetailComponent
  */
  public setMode(id) {
    this.mode = id;
    if (this.mode === 'edit' && this.paymentDetails.processor === 'Check') {
      this.initCustomerAccountingDetailForm();
      this.customerAccountingDetailForm.patchValue(this.paymentDetails);
    }
    else {
      this.paymentInvoiceCustomerAccountingDetailForm();
      this.paymentInvoiceAccountingDetailForm.patchValue(this.paymentDetails);
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description this function is use to make array base on customer id 
* @memberof CustomerAccountingDetailComponent
*/
  private nextPrevBaseOnId() {
    if (this.data.availablePayment) {
      this.idNextPrev = [];
      this.data.availablePayment.forEach(element => {
        this.idNextPrev.push(element);
      }
      );
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description this function is use to prevNext function
* @memberof CustomerAccountingDetailComponent
*/
  public prevNext(action: string) {
    if (action === 'Next') {
      this.currentCustomerIndex += 1;
      this.customerId = this.idNextPrev[this.currentCustomerIndex];
    } else if (action === 'Prev') {
      this.currentCustomerIndex -= 1;
      this.customerId = this.idNextPrev[this.currentCustomerIndex];
    }
    this.getPaymentDoc(this.customerId, 'prevNext');
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dropdown select all value 
* @memberof CustomerAccountingDetailComponent
*/
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "taxSeason":
        selected = [];
        selected = this.data.lookup.taxYearList.map(
          item => item.id
        );
        this.customerAccountingDetailForm.get("taxSeason").patchValue(selected);
        break;
      case "taxSeasonPayment":
        selected = [];
        selected = this.data.lookup.taxYearList.map(
          item => item.id
        );
        this.paymentInvoiceAccountingDetailForm.get("taxSeasonPayment").patchValue(selected);
        break;
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dropdown clear all value 
* @memberof CustomerAccountingDetailComponent
*/
  public onClearAll(clearSelectfor) {
    this.customerAccountingDetailForm.get(clearSelectfor).patchValue([]);
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dropdown clear all value 
* @memberof CustomerAccountingDetailComponent
*/
  public onClear(clearSelectfor) {
    this.paymentInvoiceAccountingDetailForm.get(clearSelectfor).patchValue([]);
  }

  /**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description dialog close method 
* @memberof CustomerAccountingDetailComponent
*/
  public close() {
    this.model.close();
  }

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.customerDataFromLedger = this.data.customerData;
    if (this.mode == 'view' || this.mode == 'edit') {
      this.availablePayment = this.data.availablePayment ? this.data.availablePayment : [];
      this.index = this.data.index;
      this.length = this.data.length;
      this.paymentInvoiceCustomerAccountingDetailForm();
      this.nextPrevBaseOnId();
      if (this.data.selectedRow) {
        this.currentCustomerIndex = this.idNextPrev.findIndex(obj => obj.id === this.data.selectedRow.id);
      }
      this.getPaymentDoc({ 'id': this.data.selectedRow.id }, 'firstTimeClickRowData');
    } else if (this.mode == 'new') {
      if (this.data.transactionType == 'Check-In' || this.data.transactionType == 'Check-Out') {
        this.paymentDetails.processor = 'Check';
        this.paymentDetails.type = this.data.transactionType;
        this.initCustomerAccountingDetailForm();
      } else {
        this.paymentDetails.processor = this.data.transactionType;
        this.paymentDetails.type = this.paymentDetails.processor;
        this.paymentInvoiceCustomerAccountingDetailForm();
      }
    }
  }
}
