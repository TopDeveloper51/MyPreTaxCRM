// External imports
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
// Internal imports
import { ContactDetailService } from '@app/contact/dialogs/contact-detail/contact-detail.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SystemConfigurationService } from '@app/shared/services/system-configuration.service';
import { MessageService, UserService, DialogService, PostalChannelService } from '@app/shared/services';
import * as moment from 'moment-timezone';
import { ContactHistoryComponent } from '@app/contact/dialogs/contact-history/contact-history.component';
import { VerifyNumberComponent } from '@app/contact/dialogs/verify-number/verify-number.component';


@Component({
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss'],
  providers: [ContactDetailService],
})
export class ContactDetailComponent implements OnInit {
  // public variable
  public contactDetailsFormData: FormGroup; // form group
  public email: FormArray; // email template form array
  public phone: FormArray; // phone template form array
  public roleList: any = []; // role list dropdown array
  public contactTypeList = []; // contact type dropdown array
  public emailStatusList = []; // email status dropdown array
  public phoneTypeList = []; // phone type dropdown array
  public countryDetails: any = []; // country details dropdown array
  public mode: boolean = false; // this variable is set save edit mode
  public createdDate; // set create date
  public updatedDate; // set updated date
  public mask:any ='(999) 999-9999';
  public contactPersonInfo: any;
  public isShowAppUserUpdateContactNo: boolean = false;
  public classificationList: any = [{ 'id': 'primary', 'name': 'Primary' }, { 'id': 'secondary', 'name': 'Secondary' }];
  public checkBox: any = { isWrongNumber: true, isInvalidNumber: false };
  public invalidCustomer: boolean = true;
  public contactDetail: any = [];
  public idNextPrev: any = [];
  public newCustomerId;
  public contactDetailReq: any;
  public currentCustomerIndex: any;
  // private variable
  private data: any;
  public emailRemovedElement: any = []; // to handle templete array for edit/remove case
  public phoneRemovedElement: any = []; // to handle templete array for edit/remove case
  public phoneVerifyFlag: any = [];
  public emailVerifyFlag: any = [];
  public isDefaultReseller: boolean;
  public isAppUser = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private contactDetailService: ContactDetailService,
    private systemConfig: SystemConfigurationService,
    private messageService: MessageService,
    private userService: UserService,
    private dialogService: DialogService,
    private postalChannelService: PostalChannelService) { }

  /**
* @author Satyam Jasoliya
* @createdDate 23-12-2019
* @description this function is used create form, form divided 3 part 1.registration 2.email part 3.phone part
* @memberof ContactDetailComponent
*/
  public contactDetailsForm() {
    this.contactDetailsFormData = this.fb.group({
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      role: this.fb.control(''),
      contactType: this.fb.control('unknown'),
      isAppUser: this.fb.control({ value: null, disabled: true }),
      registrationDate: this.fb.control({ value: '', disabled: true }),
      updatedContactNo: this.fb.control(null),
      email: this.fb.array([this.addEmailTemplateForm()]),
      phone: this.fb.array([this.addPhoneTemplateForm()])
    });
    if (this.contactPersonInfo && this.contactPersonInfo.email && this.contactPersonInfo.email.length > 0) {
      let array = this.contactDetailsFormData.get('email') as FormArray;
      array.clear();
      for (let obj in this.contactPersonInfo.email) {
        array.push(this.addEmailTemplateForm());
        array.at(array.length - 1).patchValue(this.contactPersonInfo.email[obj]);
      }
    }
    if (this.contactPersonInfo && this.contactPersonInfo.phone && this.contactPersonInfo.phone.length > 0) {
      let array = this.contactDetailsFormData.get('phone') as FormArray;
      array.clear();
      for (let obj in this.contactPersonInfo.phone) {
        array.push(this.addPhoneTemplateForm());
        array.at(array.length - 1).patchValue(this.contactPersonInfo.phone[obj]);
      }
    }
    this.watcherForEmailTemplate();
    this.watcherForPhoneTemplate();
  }



  /**
   * @author Satyam Jasoliya
   * @createdDate 23-12-2019
   * @description this function is used to disable enable status formcontrol base on email formcontrol
   * @memberof ContactDetailComponent
   */

  public watcherForEmailTemplate() {
    this.contactDetailsFormData.get('email').valueChanges.subscribe(() => {
      let a = this.contactDetailsFormData.get('email') as FormArray;
      if (a.controls) {
        for (let control of a.controls) {
          // if (control.get('email').value === '' || control.get('email').invalid) {
          //   control.get('status').disable({ emitEvent: false });
          // } else {
          //   control.get('status').enable({ emitEvent: false });
          // }
          if (!this.isDefaultReseller || this.contactDetailsFormData.get('isAppUser').value || control.get('email').value === undefined || control.get('email').value === null || control.get('email').value === '') {
            control.get('status').disable({ emitEvent: false });
            control.get('status').setValue(null, { emitEvent: false });
          } else {
            control.get('status').enable({ emitEvent: false });
          }
          if (!this.isDefaultReseller || this.contactDetailsFormData.get('isAppUser').value || control.get('isVerifiedEmail').value) {
            control.get('email').disable({ emitEvent: false });
          } else {
            control.get('email').enable({ emitEvent: false });
          }
        }
      }
    })
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to disable enable phonetype formcontrol base on number formcontrol
 * @memberof ContactDetailComponent
 */
  public watcherForPhoneTemplate() {
    this.contactDetailsFormData.get('phone').valueChanges.subscribe(() => {
      let a = this.contactDetailsFormData.get('phone') as FormArray;
      if (a.controls) {
        for (let control of a.controls) {
          // if (control.get('number').value === '' || control.get('number').invalid) {
          //   control.get('phonetype').disable({ emitEvent: false });
          // } else {
          //   control.get('phonetype').enable({ emitEvent: false });
          // }

          if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
            control.get('phonetype').disable({ emitEvent: false });
            control.get('phonetype').setValue(null, { emitEvent: false });
          } else {
            control.get('phonetype').enable({ emitEvent: false });
          }
          if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
            control.get('isWrongNumber').disable({ emitEvent: false });
          } else {
            control.get('isWrongNumber').enable({ emitEvent: false });
          }
          if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
            control.get('isInvalidNumber').disable({ emitEvent: false });
          }
          else {
            control.get('isInvalidNumber').enable({ emitEvent: false });
          }
        }
      }
    })
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to email template form control field
 * @memberof ContactDetailComponent
 */
  addEmailTemplateForm(): FormGroup {
    return this.fb.group({
      id: this.fb.control(''),
      classification: this.fb.control(null),
      email: this.fb.control('', [Validators.pattern(/^[A-Z0-9a-z\._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,15}$/)]),
      status: this.fb.control({ value: null, disabled: true }),
      isUnSubscribed: this.fb.control(false),
      unSubscribeDate: this.fb.control(''),
      unsubscribeReason: this.fb.control(''),
      isDeleted: this.fb.control(false),
      isVerifiedEmail: this.fb.control(false)
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to phone template form control field
 * @memberof ContactDetailComponent
 */
  addPhoneTemplateForm(): FormGroup {
    return this.fb.group({
      id: this.fb.control(''),
      classification: this.fb.control(undefined),
      countryCode: this.fb.control(this.countryDetails[0].value),
      number: this.fb.control(''),
      phonetype: this.fb.control({ value: undefined, disabled: true }, [Validators.required]),
      isWrongNumber: this.fb.control(false),
      isInvalidNumber: this.fb.control(false),
      isVerifiedNumber: this.fb.control(false)
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to open history dialog
 * @memberof ContactDetailComponent
 */
  public openHistory() {
    let contactDetail: any = {
      contactId: this.data.contactRowData.contactId,
      customerId: this.data.contactRowData.customerId
    }
    this.dialogService.custom(ContactHistoryComponent, { contactDetail }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((response) => {

    }, (error) => {
      console.error(error);
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to send code via email in email address
 * @param {*} emails
 * @memberof ContactDetailComponent
 */
  public sendCodeViaEmailToCustomer(emails, index) {
    if (this.mode === false) {
      this.contactDetailService.emailsendOTP({ 'email': emails.value.email }).then((response) => {
        this.dialogService.custom(VerifyNumberComponent, { 'id': response, 'type': 'Email' }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
          if (result) {
            //emails.value.isVerifiedEmail = true;
            this.email = this.contactDetailsFormData.get('email') as FormArray;
            this.emailVerifyFlag.push(this.email.value[index]);
            this.messageService.showMessage('Email verified successfully', 'success')
            this.save(this.contactPersonInfo, 'Email');
          }
        }, (error) => {
          console.error(error);
        });
      });
    }
    else {
      this.contactDetailService.emailsendOTP({ 'email': emails.value.email, 'resellerId': this.contactPersonInfo.resellerId }).then((response) => {
        this.dialogService.custom(VerifyNumberComponent, { 'id': response, 'type': 'Email' }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
          if (result) {
            this.email = this.contactDetailsFormData.get('email') as FormArray;
            this.emailVerifyFlag.push(this.email.value[index]);
            //this.phone.value[index].isDeleted = true;
            this.messageService.showMessage('Email verified successfully', 'success')
            this.save(this.contactPersonInfo, 'Email');
          }
        }, (error) => {
          console.error(error);
        });
      });
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to send OTP on customer enter number
 * @param {*} phone
 * @memberof ContactDetailComponent
 */
  public sendCodeToCustomer(phone, index) {
    let phoneEmail: any =
    {
      countryCode: phone.value.countryCode.replace(/[^\w]/gi, '').trim(),
      phoneNumber: phone.value.number.replace(/[^\w]/gi, '').trim()
    }
    this.contactDetailService.phonesendOTP(phoneEmail).then((response) => {
      this.dialogService.custom(VerifyNumberComponent, { 'id': response, 'type': 'Number' }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((result) => {
        if (result) {
          this.phone = this.contactDetailsFormData.get('phone') as FormArray;
          this.phoneVerifyFlag.push(this.phone.value[index]);
          this.messageService.showMessage('Number verified successfully', 'success')
          this.save(this.contactPersonInfo, 'Number');
        }
      }, (error) => {
        console.error(error);
      });
    });
  }

  /**
   * @author Satyam Jasoliya
   * @createdDate 23-12-2019
   * @description this function is used to save edit data
   * @param {*} forType
   * @updateddate : 21-01-2019
   * @updatedescription : handle deleted data in email and phone templete while save
   * @memberof ContactDetailComponent
   */
  public save(contactPersonInfo?: any, forType?: any) {
    let parameterObject = this.contactDetailsFormData.getRawValue();
    if (this.mode === false) {
      parameterObject.customerId = this.data.customerId;
      parameterObject.isTestCustomer = false;
    }
    else {
      // append deleted element in array
      this.emailRemovedElement.forEach(element => {
        element.isDeleted = true;
        parameterObject.email.push(element);
      });
      this.phoneRemovedElement.forEach(element => {
        element.isDeleted = true;
        parameterObject.phone.push(element);
      });
      this.emailVerifyFlag.forEach(element => {
        element.isVerifiedEmail = true;
        parameterObject.email.push(element);
      });
      this.phoneVerifyFlag.forEach(element => {
        element.isVerifiedNumber = true;
        parameterObject.phone.push(element);
      });

      parameterObject.customerId = this.data.contactRowData.customerId;
      parameterObject.contactId = this.data.contactRowData.contactId;
      parameterObject.resellerId = this.contactPersonInfo.resellerId;
      parameterObject.updatedBy = this.contactPersonInfo.updatedBy;
      parameterObject.updatedByName = this.contactPersonInfo.updatedByName;
      parameterObject.updatedDate = this.contactPersonInfo.updatedDate;
      parameterObject.createdBy = this.contactPersonInfo.createdBy;
      parameterObject.createdDate = this.contactPersonInfo.createdDate;
      parameterObject.createdByName = this.contactPersonInfo.createdByName;
      parameterObject.isTestCustomer = false;
    }

    for (let i in parameterObject.email) {
      if (!parameterObject.email[i].unSubscribeDate) {
        delete parameterObject.email[i].unSubscribeDate;
      }
      if (!parameterObject.email[i].classification) {
        delete parameterObject.email[i].classification;
      }
      if (!parameterObject.email[i].unsubscribeReason) {
        delete parameterObject.email[i].unsubscribeReason;
      }
      if (parameterObject.email[i].status && !parameterObject.email[i].status.value) {
        delete parameterObject.email[i].status.value;
      }
      if (parameterObject.email[i].status && !(Object.keys(parameterObject.email[i].status) && Object.keys(parameterObject.email[i].status).length > 0)) {
        delete parameterObject.email[i].status;
      }
    }
    for (let i in parameterObject.phone) {
      if (!parameterObject.phone[i].classification) {
        delete parameterObject.phone[i].classification;
      }
      if (!parameterObject.phone[i].number) {
        delete parameterObject.phone[i].number;
      }
      if (!parameterObject.phone[i].phonetype) {
        delete parameterObject.phone[i].phonetype;
      }
      if (parameterObject.phone[i].number) {
         let numberTrim = parameterObject.phone[i].number;
         parameterObject.phone[i].number = numberTrim.replace(/[^\w]/gi, '').trim();
      }
    }

    for (const key in parameterObject) {
      if (parameterObject.hasOwnProperty(key) && (!parameterObject[key])) {
        delete parameterObject[key];
      }
    }

    this.contactDetailService.saveContact(parameterObject).then((response) => {
      if(this.mode === false)
      {
        this.messageService.showMessage('Contact save successfully', 'success');
        this.modal.close(parameterObject.customerId);
      } 
      else
      {
        if (forType == 'Number') {
          this.messageService.showMessage('Number verified and saved successfully', 'success');
        } else if (forType == 'Email') {
          this.messageService.showMessage('Email verified and saved successfully', 'success');
        }
        this.messageService.showMessage('Contact update successfully', 'success');
        this.modal.close(parameterObject.customerId);
      }         
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to return form array in phone part
 * @memberof ContactDetailComponent
 */
  get phoneData() {
    return <FormArray>this.contactDetailsFormData.get('phone');
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to return form array in email part
 * @memberof ContactDetailComponent
 */
  get emailData() {
    return <FormArray>this.contactDetailsFormData.get('email');
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to get contact details
 * @memberof ContactDetailComponent
 */
  public getContactDetails(from, id?) {
    if (id) {
      this.contactDetailReq = {
        contactId: id.contactId,
        customerId: id.customerId
      }
    } else {
      this.contactDetailReq = {
        contactId: this.data.contactRowData.contactId,
        customerId: this.data.contactRowData.customerId
      }
    }
    this.contactDetailService.getContactDetails(this.contactDetailReq).then((response: any) => {
      this.contactPersonInfo = response;
      this.createdDate = moment(this.contactPersonInfo.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      this.updatedDate = moment(this.contactPersonInfo.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      this.contactDetailsForm();
      this.updateContactFillData();
      setTimeout(() => {
        this.contactDetail = JSON.parse(JSON.stringify((this.contactDetailsFormData.value)));
      }, 500);
      if (from == 'prevnext') {
        if (this.contactPersonInfo.isAppUser) {
          this.getAppUserNo(id);
        }
      }

    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used next previous base on contact id
 * @memberof ContactDetailComponent
 */
  private nextPrevBaseOnContactId() {
    if (this.data.nextPrev) {
      this.idNextPrev = [];
      this.data.nextPrev.forEach(element => {
        this.idNextPrev.push(element);
      }
      );
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used next previous 
 * @memberof ContactDetailComponent
 */
  public prevNext(action: string) {
    if (action === 'Next') {
      this.currentCustomerIndex += 1;
      this.newCustomerId = this.idNextPrev[this.currentCustomerIndex];
    } else if (action === 'Prev') {
      this.currentCustomerIndex -= 1;
      this.newCustomerId = this.idNextPrev[this.currentCustomerIndex];
    }
    this.getContactDetails('prevnext', this.newCustomerId);

  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to get app user number
 * @memberof ContactDetailComponent
 */
  public getAppUserNo(contactId) {
    if (contactId && this.newCustomerId) {
      var getUserNumber: any = {
        contactId: this.newCustomerId.contactId,
      }
    }
    else {
      var getUserNumber: any = {
        contactId: this.data.contactRowData.contactId,
      }
    }
    this.contactDetailService.getAppUserNumber(getUserNumber).then((response: any) => {
      if (response) {
        this.contactDetailsFormData.controls.updatedContactNo.setValue(response.phoneNumber);
        this.isShowAppUserUpdateContactNo = true;
      }
    }, (error) => {
      this.isShowAppUserUpdateContactNo = false;
      this.messageService.showMessage('Internal server error', 'error');
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to update register number
 * @param {*} id
 * @memberof ContactDetailComponent
 */
  public updateAppUserNumber(): void {
    //let phoneNo = updatedNo.replace(/[^\w]/gi, '').trim();
    let updatedUserNumber: any = {
      contactId: this.data.contactRowData.contactId,
      phone: this.contactDetailsFormData.get('updatedContactNo').value.replace(/[^\w]/gi, '').trim()
    }
    this.contactDetailService.updateAppUserNumber(updatedUserNumber).then((response: any) => {
      this.isShowAppUserUpdateContactNo = false;
      this.messageService.showMessage('User phone number saved successfully', 'success');
    }, (error) => {
      this.messageService.showMessage('Something wrong', 'error');
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to update contact form data
 * @memberof ContactDetailComponent
 */
  updateContactFillData() {
    this.contactDetailsFormData.patchValue(this.contactPersonInfo);
    if (this.contactPersonInfo && this.contactPersonInfo.registrationDate) {
      this.contactDetailsFormData.controls.registrationDate.setValue(moment(this.contactPersonInfo.registrationDate).format('MM/DD/YY'));
    }
    this.updateEmailAndPhone();
  }

  updateEmailAndPhone() {
    let a = this.contactDetailsFormData.get('email') as FormArray;
    if (a.controls) {
      for (let control of a.controls) {
        if (!this.isDefaultReseller || this.contactDetailsFormData.get('isAppUser').value || control.get('email').value === undefined || control.get('email').value === null || control.get('email').value === '') {
          control.get('status').disable({ emitEvent: false });
        }
        if (!this.isDefaultReseller || this.contactDetailsFormData.get('isAppUser').value || control.get('isVerifiedEmail').value) {
          control.get('email').disable({ emitEvent: false });
        }
      }
    }

    let b = this.contactDetailsFormData.get('phone') as FormArray;
    if (b.controls) {
      for (let control of b.controls) {
        if (control.get('isVerifiedNumber').value) {
          control.get('countryCode').disable({ emitEvent: false });
        }
        if (control.get('isVerifiedNumber').value) {
          control.get('number').disable({ emitEvent: false });
        }
        if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
          control.get('phonetype').disable({ emitEvent: false });
        }
        if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
          control.get('isWrongNumber').disable({ emitEvent: false });
        }
        if (control.get('isVerifiedNumber').value || control.get('number').value === '') {
          control.get('isInvalidNumber').disable({ emitEvent: false });
        }
      }
    }


  }


  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to create dynamic form in email part
 * @memberof ContactDetailComponent
 */
  emailTemplateArray(): void {
    this.email = this.contactDetailsFormData.get('email') as FormArray;
    this.email.push(this.addEmailTemplateForm());
  }
  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to create dynamic form in phone part
 * @memberof ContactDetailComponent
 */
  phoneTemplateArray(): void {
    this.phone = this.contactDetailsFormData.get('phone') as FormArray;
    this.phone.push(this.addPhoneTemplateForm());
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to remove dynamic form row index in email part
 * @param {*} index
 * @memberof ContactDetailComponent
 */
  removeEmailForm(index) {
    this.email = this.contactDetailsFormData.get('email') as FormArray;
    this.emailRemovedElement.push(this.email.value[index]);
    this.email.removeAt(index);
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description  this function is used to remove dynamic form row index in phone part
 * @param {*} index
 * @memberof ContactDetailComponent
 */
  removePhoneForm(index) {
    this.phone = this.contactDetailsFormData.get('phone') as FormArray;
    this.phoneRemovedElement.push(this.phone.value[index]);
    this.phone.removeAt(index);
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used fill role list dropdown data
 * @memberof ContactDetailComponent
 */
  private getRoleListData() {
    this.contactDetailService.getRoleList().then((response) => {
      this.roleList = response;
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used fill contact type dropdown data
 * @memberof ContactDetailComponent
 */
  private contactType() {
    this.contactDetailService.getContectType().then((response: any) => {
      this.contactTypeList = response.contactType;
      this.phoneTypeList = response.phoneType;
    });
  }


  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to email status dropdown data
 * @memberof ContactDetailComponent
 */
  private emailStatus() {
    this.contactDetailService.getEmailStatus().then((response: any) => {
      this.emailStatusList = response;
    });
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to country list dropdown data
 * @memberof ContactDetailComponent
 */
  private getCountryCodeList() {
    const countryDetailsData = this.systemConfig.getCountryDetail();
    this.countryDetails = [];
    for (const obj of countryDetailsData) {
      this.countryDetails.push({ value: obj.dialCode.replace(/[^\w]/gi, '').trim(), dialCode: obj.dialCode, label: obj.countryName + ' ' + obj.dialCode, countryCode: obj.countryCode });
    };
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to delete open record
 * @memberof ContactDetailComponent
 */
  public delete() {
    if (this.data.contactRowData) {
      const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to delete?' };
      this.dialogService.confirm(dialogData, {}).result.then((response) => {
        if (response === 'YES') {
          this.contactDetailService.deleteContactDetail(this.data.contactRowData).then((result) => {
            this.messageService.showMessage('Contact deleted successfully', 'success');
            this.modal.close(true);
            this.postalChannelService.PublishPostalEvent({
              channel: '',
              data: this.data.contactRowData.customerId,
              topic: 'contactGridRefereshData',
              envelope: ''
            });
          }, error => {
            this.messageService.showMessage('Contact deleted unsuccessful', 'error');
            console.error(error);
          });
        }
      }, (error) => {
        console.error(error);
      });
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to on select all dropdown data
 * @memberof ContactDetailComponent
 */
  public onSelectAll(multipleSelectfor) {
    let selected;
    switch (multipleSelectfor) {
      case "roleList":
        selected = [];
        selected = this.roleList.map(
          item => item.id
        );
        this.contactDetailsFormData.get('role').patchValue(selected);
        break;
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to clear data
 * @memberof ContactDetailComponent
 */
  public onClearAll(clearSelectfor) {
    switch (clearSelectfor) {
      case "roleList":
        this.contactDetailsFormData.get("role").patchValue([]);
        break;
    }
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 23-12-2019
 * @description this function is used to close the dialog
 * @param {*} id
 * @memberof ContactDetailComponent
 */
  public close(): void {
    this.modal.close();
  }
  checkChanges(performedAction, data?: any) {
    if (this.invalidCustomer) {
      if (this.checkContactScope()) {
        const dialogData = { title: 'Confirmation', text: `Are you sure, you want to save changes?` };
        this.dialogService.confirm(dialogData, { 'isDontSave': true }).result.then((response) => {
          if (response === "YES") {
            this.save(this.contactPersonInfo, 'manual');
          } else if (response === "No") {
            if (performedAction == "") {
              this.modal.close();
            }
          }
        }, error => {
          console.error(error);
        });
      } else {
        if (performedAction == "") {
          this.modal.close();
        }
      }
    } else {
      this.close()
    }
  }

  public checkContactScope() {
    if (this.contactDetailsFormData.dirty) {
      return true;
    } else {
      return false;
    }

  }


  ngOnInit() {
    if (this.data.unidentifiedCustomer) {
      this.invalidCustomer = false;
    }
    if (this.data.contactRowData) {
      this.mode = true;
      if (this.data.contactRowData.isAppUser) {
        this.isAppUser = true;
      } else {
        this.isAppUser = false;
      }
      this.getContactDetails('init');
    }
    else {
      this.mode = false;
    }
    this.getRoleListData();
    this.contactType();
    this.emailStatus();
    this.getCountryCodeList();
    this.contactDetailsForm();
    this.nextPrevBaseOnContactId();
    if (this.data.contactRowData) {
      this.currentCustomerIndex = this.idNextPrev.findIndex(obj => obj.contactId === this.data.contactRowData.contactId);
    }
    this.isDefaultReseller = this.userService.isDefaultReseller();

  }
}
