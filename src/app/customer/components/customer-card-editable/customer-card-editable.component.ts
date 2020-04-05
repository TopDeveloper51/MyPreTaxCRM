//external imports
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { NgSelectComponent } from "@ng-select/ng-select";
import * as _ from 'lodash';

//internal imports
import { CDRService, MessageService, LocalStorageUtilityService } from "@app/shared/services";
import { CustomerSearchService } from "@app/customer/customer-search/customer-search.service";
import { CustomerCardEditableService } from "@app/customer/components/customer-card-editable/customer-card-editable.service";
import { DialogService } from "@app/shared/services/dialog.service";
import { VerifyCustomerComponent } from "@app/customer/dialogs/verify-customer/verify-customer.component";
import { UserService } from "@app/shared/services/user.service";
import { environment } from '@environments/environment';
@Component({
  selector: 'app-customer-card-editable',
  templateUrl: './customer-card-editable.component.html',
  styleUrls: ['./customer-card-editable.component.scss']
})
export class CustomerCardEditableComponent implements OnInit {

  @Input() screen: string = '';
  @Input() lookup: any = {};
  @Input() customerDetails: any = {};
  @Input() getFormValue: boolean = false;
  @Input() mode;
  // @Output()
  @Output() customerSearchFormValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearCustomerSearchFormValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() getCustomerDetails: EventEmitter<any> = new EventEmitter<any>();


  public customerSearchForm: FormGroup;
  public isSaveCalled: boolean = false;
  unidentifiedCustomer: boolean;
  userDetails: any = this.userService.getUserDetail();
  constructor(private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cdrService: CDRService,
    private messageService: MessageService,
    private customerSearchService: CustomerSearchService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private customerCardEditableService: CustomerCardEditableService,
    private dialogService: DialogService,
    private userService: UserService) { }


  /**
 * @author Dhruvi Shah
 * @createdDate 15/10/2019
 * @description mark Select all in lookup
 * @param {*} lookupName
 * @memberof CustomerSearchComponent
 */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "preferredLanguage":
        selected = [];
        selected = this.lookup.preferredLanguageList.map(
          item => item.id
        );
        this.customerSearchForm.get("preferredLanguage").patchValue(selected);
        break;
      case "customerType":
        selected = [];
        selected = this.lookup.customerTypeList.map(item => item.id);
        this.customerSearchForm.get("customerType").patchValue(selected);
        break;
      case "salesProcessStatus":
        selected = [];
        selected = this.lookup.salesProcessStatusList.map(
          item => item.id
        );
        this.customerSearchForm
          .get("salesProcessStatus")
          .patchValue(selected);
        break;
      case "bank":
        selected = [];
        selected = this.lookup.bankList.map(item => item.id);
        this.customerSearchForm.get("bank").patchValue(selected);
        break;
      case "resellerId":
        selected = [];
        selected = this.lookup.resellerList.map(item => item.id);
        this.customerSearchForm.get("resellerId").patchValue(selected);
        break;
      case "country":
        selected = [];
        selected = this.lookup.countryList.map(item => item.id);
        this.customerSearchForm.get("country").patchValue(selected);
        break;
      case "state":
        selected = [];
        selected = this.lookup.stateList.map(item => item.id);
        this.customerSearchForm.get("state").patchValue(selected);
        break;
      case "software":
        selected = [];
        selected = this.lookup.softwareList.map(item => item.id);
        this.customerSearchForm.get("software").patchValue(selected);
        break;
      case "refundRequestFeeling":
        selected = [];
        selected = this.lookup.refundRequestFeelingList.map(item => item.id);
        this.customerSearchForm.get("refundRequestFeeling").patchValue(selected);
        break;
      default:
        break;
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description clear selected val from lookup
   * @param {*} clearSelectfor
   * @memberof CustomerSearchComponent
   */
  public onClearAll(clearSelectfor) {
    this.customerSearchForm.get(clearSelectfor).patchValue([]);
  }


  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description close deop-down
   * @param {NgSelectComponent} select
   * @memberof CustomerSearchComponent
   */
  public closeSelect(select: NgSelectComponent) {
    select.close();
  }

  public clear() {
    this.customerSearchForm.reset();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 14/10/2019
   * @memberof CustomerSearchComponent
   */
  public initCustomerSearchForm(): void {
    this.customerSearchForm = this.fb.group({
      // customerName: ['', Validators.required],
      customerName: [""],
      customerId: [""],
      phoneNotFound: [null],
      isTestCustomer: [false],
      // demoCustomer: [null],
      preferredLanguage: [undefined],
      customerNumber: [""],
      DBA: [""],
      customerType: [undefined],
      CPAGroup: [null],
      betaTester: [null],
      testimonial: [null],
      EROCompliance: [null],
      fastCashAdvanceCompliance: [null],
      salesProcessStatus: [undefined],
      email: [""],
      doNotCall: [null],
      isCurrentRefundRequest: [null],
      bank: [""],
      resellerId: [undefined],
      phone: [""],
      doNotSendMail: [null],
      isRefundRequestDenied: [null],
      BPVolumeFrom: [""],
      BPVolumeTo: [""],
      unknownVolume: [null],
      address1: [""],
      address2: [""],
      country: [undefined],
      state: [undefined],
      zipCode: [""],
      city: [""],
      dontSendSMS: [null],
      isRefundRequestHandled: [null],
      sinceHowManyYearsWithUsFrom: [""],
      sinceHowManyYearsWithUsTo: [""],
      ElectronicReturnOriginator: [null],
      noConversionNeeded: [null],
      refundRequestFeeling: null,
      software: [""],
      resellerName: "",
      //responsible: [""],
      homepage: [""],
      isEfinHolder: [null],
      // bankSpecialPricing: [false],
      transmitterFeeFrom: [null],
      transmitterFeeTo: [null],
      addOnTransmitterSharePerFrom: [null],
      addOnTransmitterSharePerTo: [null],
      addOnPPSharePerFrom: [null],
      addOnPPSharePerTo: [null]
    });
    this.customerNumberdisabled();
    if (this.localStorageUtilityService.checkLocalStorageKey('customerSearchObject')) {
      this.customerSearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('customerSearchObject'));
    }
  }


  /**
* @author Satyam Jasoliya
* @createdDate 03/01/2020
* @description this method is use to customerNumber field disabled
* @memberof CustomerCardEditableComponent
*/
  private customerNumberdisabled() {
    if (this.mode) {
      this.customerSearchForm.controls['customerNumber'].disable();
    }

    if (this.screen == 'customerCard') {
      this.customerSearchForm.controls['ElectronicReturnOriginator'].disable();
    }
    else {
      this.customerSearchForm.controls['ElectronicReturnOriginator'].enable();
    }
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 03/01/2020
  * @description this method is use to clear null form value
  * @memberof CustomerCardEditableComponent
  */
  emitFormValue() {
    for (const key in this.customerSearchForm.value) {
      if (!this.customerSearchForm.value[key]) {
        delete this.customerSearchForm.value[key];
      }
    }
    this.customerSearchFormValue.emit(this.customerSearchForm.value);
  }

  public newCustomer(): void {
    this.router.navigate(['customer', 'new']);
  }

  /**
   * @author Dhruvi shah
   * @description emit event to clear search data and listen to customer-search
   * @memberof CustomerCardEditableComponent
   */
  public clearSearch(): void {
    this.clearCustomerSearchFormValue.emit(this.customerSearchForm.value);
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 03/01/2020
 * @description this method is use to save customer details
 * @memberof CustomerCardEditableComponent
 */
  public saveDetails() {
    this.isSaveCalled = true;
    if (this.customerSearchForm && this.isSaveCalled) {
      this.emitFormValue();
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 03/01/2020
 * @description this method is use to redirect customer tab
 * @memberof CustomerCardEditableComponent
 */
  public backCustomerSearch() {
    this.router.navigateByUrl('/customer');
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 03/01/2020
 * @description this method is use to enable disable conversion
 * @memberof CustomerCardEditableComponent
 */
  public enableConversion() {
    let enableConObject: any = {
      'enableConversion': this.customerDetails.enableConversion ? false : true,
      'customerId': this.customerDetails.customerId
    }
    this.customerCardEditableService.getEnableConversation(enableConObject).then((response: any) => {
      if (response === true) {
        this.messageService.showMessage('Conversion Enabled Successfully', 'success');
      } else {
        this.messageService.showMessage('Conversion Disabled Successfully', 'success');
      }
      this.getCustomerDetails.emit(this.customerDetails.customerId);
    }, error => {
      if (error && error.code == 4021) {
        this.messageService.showMessage('License details does not exist', 'error');
      }
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 03/01/2020
 * @description this method is use to allow access
 * @memberof CustomerCardEditableComponent
 */
  public allowAccess() {
    let allowAccessObj: any = {
      'allowAccess': this.customerDetails.allowAccess ? false : true,
      'customerId': this.customerDetails.customerId
    }
    this.customerCardEditableService.getAllowAccess(allowAccessObj).then((response: any) => {
      if (response && this.customerDetails.allowAccess) {
        this.messageService.showMessage('Access Disabled Successfully', 'success');
      } else if (response && (this.customerDetails.allowAccess == undefined || this.customerDetails.allowAccess == false)) {
        this.messageService.showMessage('Access Allowed Successfully', 'success');
      }
      this.getCustomerDetails.emit(this.customerDetails.customerId);
    }, error => {
      if (error && error.code == 4021) {
        this.messageService.showMessage('License details does not exist', 'error');
      }
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 03/01/2020
 * @description this method is use to get duplicate customer record
 * @memberof CustomerCardEditableComponent
 */
  public checkDuplicateCustomer() {
    this.customerCardEditableService.getCheckDuplicateCustomerList({ 'customerId': this.customerDetails.customerId }).then((response: any) => {
      if (response.duplicateCustomers) {
        this.dialogService.custom(VerifyCustomerComponent, { 'data': response.duplicateCustomers }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
          (response) => {

          }, (error) => {
            console.error(error);
          });
      }
      else {
        this.messageService.showMessage('No Duplicate Found', 'error');
      }
    });
  }


  /**
  * @author Manali Joshi
  * @createdDate 13/01/2020
  * @description  Function is use to login and redirect to tax application
  * @memberof loginInSoftware
  */
  public loginInSoftware() {
    this.customerCardEditableService.FirmSetupLogin(this.customerDetails.customerId, "ticket issue" ).then((xsrftoken: any) => {
      if (xsrftoken) {
        window.open(environment.taxapp_url + '?token=' + xsrftoken, '_blank');
      } else {
        this.messageService.showMessage('Authentication fail for Software', 'error');
      }
    });
    return false;
  }

  /**
   * @author Manali Joshi
   * @createdDate 20/01/2020
   * @description call on click of "Enable Fee Collect" button
   * @memberof CustomerCardEditableComponent
   */
  public enableFeeCollectProgram() {
    let jsonToPass: any = {
      'isFeeCollectProgramAvailable': this.customerDetails.isFeeCollectProgramAvailable ? false : true,
      'customerId': this.customerDetails.customerId
    };
    this.customerCardEditableService.EnableFeeCollectionProgram({ 'parameterObject': jsonToPass }).then((response: any) => {
      if (response) {
        this.messageService.showMessage('Fee Collect Program Enabled Successfully', 'success');
      } else {
        this.messageService.showMessage('Customer Is Not License Holder.', 'error');
      }
      this.getCustomerDetails.emit(this.customerDetails.customerId);
    }, error => {
      this.messageService.showMessage('Customer Is Not License Holder.', 'error');
    });
  }


  ngOnInit() {
    this.initCustomerSearchForm();
    // this.customerDetails.enableConversion = this.customerDetails.enableConversion ? false : true;
    if (this.userDetails.crmAppConfig.unIdentifiedCustomer.ids.includes(this.customerDetails.customerId) == true) {
      this.unidentifiedCustomer = true;
    } else {
      this.unidentifiedCustomer = false;
    }
    if (this.screen == "customerCard") {
      this.customerSearchForm.controls.customerName.setValidators([Validators.required]);
      // if(this.lookup ){
      //   this.customerSearchForm.controls.resellerId.setValue(this.lookup.resellerList[3].id);
      // }
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.lookup && changes.lookup.currentValue && Object.keys(changes.lookup.currentValue).length > 0) {
      if (this.screen == "customerCard") {
        this.customerSearchForm.controls.resellerId.setValue(this.lookup.resellerList[3].id);
        for (const obj in changes.lookup.currentValue) {
          _.remove(changes.lookup.currentValue[obj], function (obj) {
            return obj.id === 'blank';
          });
        }

      }

      if (this.screen == "customerCard") {
        this.customerSearchForm.controls.resellerId.setValue(this.lookup.resellerList[3].id);
      }
      // check if customerSearch object is available in local storage
      if (this.localStorageUtilityService.checkLocalStorageKey('customerSearchObject') && this.customerSearchForm) {
        // get customerSearch object from local storage
        this.customerSearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('customerSearchObject'));
      }
    }
    if (changes.customerDetails && changes.customerDetails.currentValue && Object.keys(changes.customerDetails.currentValue).length > 0) {
      this.customerSearchForm.patchValue(changes.customerDetails.currentValue);
    }
    if (this.customerSearchForm && changes.isSaveCalled && changes.isSaveCalled.currentValue) {
      this.emitFormValue();
    }
    if (this.customerSearchForm && changes.getFormValue && changes.getFormValue.currentValue) {
      this.emitFormValue();
    }
  }

}
