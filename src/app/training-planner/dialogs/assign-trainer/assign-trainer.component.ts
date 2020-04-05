// External imports 
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
// Internal imports
import { SystemConfigurationService, LocalStorageUtilityService, MessageService } from '@app/shared/services';
import { AssignTrainerService } from '@app/training-planner/dialogs/assign-trainer/assign-trainer.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-trainer',
  templateUrl: './assign-trainer.component.html',
  styleUrls: ['./assign-trainer.component.scss']
})
export class AssignTrainerComponent implements OnInit {

  public assignTrainnerForm: FormGroup;
  public data: any = {}; // to holds input data
  public purposeList: Array<any> = []; // holds purpose list
  public slotDetails: any = {}; // hold slot details
  public exactDate: any; // holds exact date
  public country: any = []; // holds country details
  public lookupData: any; // hold lookup data
  public responsiblePersonTempArray: any = []; // temp array of responsible person
  public disableSave: boolean; // to disable save
  public time: string; // hold time
  public activeCallDetails: any; // holds active call details
  public contactPersonData: any; // store contact person data
  public customerId: any; // holds customer id 
  public customerName: any; // holds customer name
  public autocomplete: any = {}; // to auto complete feild
  public contactPersonEmailArray: any = []; // hold contact email array
  public contactPersonPhoneArray: any = []; // hold contact phone Array
  public contactPersonLastNameArray: any = []; // hold contact lastname array
  public contactPersonFirstNameArray: any = []; // hold contact firstname array
  public newContactPersonFirstNameArray: any = []; // new contact firstname array 
  public newContactPersonLastNameArray: any = []; // new contact lastname array
  public newContactPersonPhoneArray: any = []; // new contact phone array
  public newContactPersonEmailArray: any = []; // new contact email array
  public desiredTimeInEt: string; // desired time in et
  public countryname: any;

  constructor(private cdr: ChangeDetectorRef, public fb: FormBuilder, public model: NgbActiveModal, private messageService: MessageService, private localStorageUtilityService: LocalStorageUtilityService, private systemConfig: SystemConfigurationService, private assignTrainerService: AssignTrainerService) { }


  /**
   * @author Mansi Makwana
   * @createdDate 28-11-2019
   * @discription to create assign trainer  form
   * @memberOf AssignTrainerComponent
   */

  public initAssignTrainerForm() {
    this.assignTrainnerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      countryCode: '',
      phone: ['', Validators.required],
      email: '',
      time: ['', Validators.required],
      purpose: '',
      responsiblePersonList: '',
      comment: '',
    });
    this.cdr.detectChanges();

  }
  /**
   * @author om kanada
   * @description
   *        This function is on start time change.
   * @param event
   *      event holds events to perform.
   * @memberof AssignTrainerComponent
   */
  onStartTimeChange(event: any): void {
    if (event !== undefined && event !== null) {
      const tempDate = moment(this.exactDate).format('YYYY-MM-DD') + ' ' + moment(event).format('HH:mm:ss');
      this.slotDetails.date = moment.tz(tempDate, 'YYYY-MM-DD HH:mm:ss', 'America/New_York').utc().format();
      this.slotDetails.desiredTime = moment(this.slotDetails.date).utc().format('HH:mm');
      const timeInUTC = moment.tz(this.slotDetails.time, 'hh:mm A', 'America/New_York').utc().format('hh:mm A');
      // console.log(moment.tz(this.slotDetails.date + ' ' + this.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').format());
      const startTime = moment(tempDate).format('YYYY-MM-DD') + ' ' + this.slotDetails.time;
      const startTimeProper = moment(startTime).format('YYYY-MM-DD HH:mm:ss')
      const startTimeNY = moment.tz(startTimeProper, 'YYYY-MM-DD hh:mm:ss', 'America/New_York').utc().format();
      const minTime = moment(startTimeNY).subtract(0, 'minutes').utc().format();
      const maxTime = moment(startTimeNY).add(15, 'minutes').utc().format();
      if (this.slotDetails.date < minTime) {
        this.messageService.showMessage('Desired Time should not be more than 15 minutes of the starting time of the slot selected', 'error');
        // this.messageService.showMessage({ 'type': 'error', 'message': 'Desired Time should not be more than 15 minutes of the starting time of the slot selected', duration: 5000 });
        this.disableSave = true;
      } else if (this.slotDetails.date > maxTime) {
        this.messageService.showMessage('Desired Time should not be more than 15 minutes of the starting time of the slot selected', 'error');
        this.disableSave = true;
      } else {
        this.disableSave = false;
      }
      this.desiredTimeInEt = moment(this.slotDetails.date).tz('America/New_York').format('MM/DD/YY hh:mm A');
    } else {
      this.desiredTimeInEt = '';
    }
  }
  /**
   * @author om kanada
   * @description
   *        This function is save Trainer.
   * @memberof AssignTrainerComponent
   */
  public save(): void {
    if (!this.data.details.activityId && this.localStorageUtilityService.checkLocalStorageKey('activeCallDetails')) {
      this.slotDetails.firstName = this.assignTrainnerForm.controls.firstName.value;
      this.slotDetails.lastName = this.assignTrainnerForm.controls.lastName.value;
      if (this.autocomplete.phone) {
        this.slotDetails.phoneNumber = this.autocomplete.phone.replace(/[^\w]/gi, '').trim();
      } else {
        this.slotDetails.phoneNumber = this.assignTrainnerForm.controls.phone.value.replace(/[^\w]/gi, '').trim();
      }
      this.slotDetails.email = this.assignTrainnerForm.controls.email.value;
      this.slotDetails.countryCode = this.assignTrainnerForm.controls.countryCode.value;
      this.slotDetails.customerId = this.data.activeCallDetails.customerID;
    } else {
      this.slotDetails.activityId = this.data.details.activityId;
      this.slotDetails.customerId = this.data.activeCallDetails.customerID;
      const responsibleCurrentIndex = this.responsiblePersonTempArray.findIndex(t => t.id === this.assignTrainnerForm.controls.responsiblePersonList.value);
      if (responsibleCurrentIndex !== -1) {
        this.slotDetails.responsiblePerson = this.responsiblePersonTempArray[responsibleCurrentIndex].name;
      }
      this.slotDetails.responsiblePerson_value = this.assignTrainnerForm.controls.responsiblePersonList.value;
    }
    this.slotDetails.comment = this.assignTrainnerForm.controls.comment.value;;

    if (this.data.details.activityId || (this.slotDetails.phoneNumber && !this.data.details.activityId)) {
      this.assignTrainerService.saveAssignTrainer(this.slotDetails).then(response => {
        if (this.data.details.activityId) {
          this.messageService.showMessage('Trainer Assigned successfully', 'success');
        } else {
          // this.localStorageUtilityService.removeFromLocalStorage('activeCallDetails');
          this.messageService.showMessage('Time slot booked successfully', 'success');
        }
        this.model.close(true);
      }, error => {
        console.error(error);
      });
    } else {
      this.messageService.showMessage('No Active Call found or Unable to Identify Customer Details, you can go to customer card in order to book appointment manually', 'error');
    }
  }
  /**
   * @author om kanada
   * @param customerId 
   *          holds customer id
   * @description
   *        redirect to edit customer screen when record is selected.
   * @memberof AssignTrainerComponent
   */
  public openCustomerCard(customerId: any): void {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  onClearAll() {
    this.lookupData.responsiblePesronList = this.lookupData.responsiblePesronList;
  }
  /**
   * @author om kanada
   * @description
   *        close dialogbox.
   * @memberof AssignTrainerComponent
   */
  public close(): void {
    this.model.close();
  }

  /**
   * @author om kanada
   * @description
   *        get responsible person result from Api.
   * @memberof AssignTrainerComponent
   */
  public getResponsiblePersonlookup(): void {
    this.assignTrainerService.getResponsiblePersonlookup().then(response => {
      if (response) {
        this.lookupData = response;

        this.responsiblePersonTempArray = JSON.parse(JSON.stringify(this.lookupData.responsiblePesronList));
        this.lookupData.responsiblePesronList = [];

        for (const obj of this.responsiblePersonTempArray) {
          const objname = this.lookupData.responsiblePesronList.find(o => obj.group === o.groupName);

          if (obj.group === 'Support - US' || obj.group === 'Customer Relation') {
            if (objname !== undefined) {
              objname.group.push({ id: obj.id, name: obj.name });
            } else {
              this.lookupData.responsiblePesronList.push({ groupName: obj.group, group: [{ id: obj.id, name: obj.name }] });
            }
          }

        }
      }
    },
      error => {
        console.error('ERROR  : ' + error);
      });
  }
  /**
   * @author om kanada
   * @description
   *        this function convet date to dst format.
   * @memberof AssignTrainerComponent
   */
  public isDSTFormat(): boolean {
    return moment.tz(this.slotDetails.date + ' ' + this.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').isDST()
  }
  /**
   * @author om kanada
   * @param contactDetails
   *        holds contact details
   * @description
   *         select value from contact Details.
   * @memberof AssignTrainerComponent
   */
  public selectValue(contactDetails): void {
    this.autocomplete.contactPersonId = contactDetails.contactPersonId;
    const name = contactDetails.contactPersonName.split(',');
    this.autocomplete.firstName = name && name[1] ? name[1].trim() : '';
    this.autocomplete.lastName = name && name[0] ? name[0].trim() : '';
    this.autocomplete.email = contactDetails.email;
    this.autocomplete.phone = contactDetails.phone;
    this.autocomplete.countryCode = contactDetails.countryCode || '1';
    this.assignTrainnerForm.controls.firstName.setValue(this.autocomplete.firstName);
    this.assignTrainnerForm.controls.lastName.setValue(this.autocomplete.lastName);
    this.assignTrainnerForm.controls.phone.setValue(this.autocomplete.phone);
    this.assignTrainnerForm.controls.email.setValue(this.autocomplete.email);
    this.assignTrainnerForm.controls.countryCode.setValue(this.autocomplete.countryCode);
  }
  /**
   * @author om kanada
   * @description
   *         get customer data from Api.
   * @memberof AssignTrainerComponent
   */
  public getCustomerData(): void {
    this.assignTrainerService.getCustomerData(this.activeCallDetails.customerID).then(
      response => {
        const contactData = response.contactPerson;
        this.customerName = response.customerName;
        this.customerId = this.activeCallDetails.customerID;
        const contactId = this.activeCallDetails.contactPersonId;
        const contactPhoneNo = this.activeCallDetails.phoneNumber;
        const contactPersonName = this.activeCallDetails.customerName;
        this.countryname = response.country;
        this.contactPersonData = _.sortBy(contactData, (obj: any) => {
          return obj.contactPersonName && obj.contactPersonName.toLowerCase();
        });


        if (contactId && contactId.length > 0) {
          const contactDetails = this.contactPersonData.find(t => t.contactPersonId === contactId[0])
          if (contactDetails) {
            this.selectValue(contactDetails);
          }
        } else if (contactPhoneNo && contactPhoneNo.length > 0) {
          const contactDetails = this.contactPersonData.find(t => {
            if (t.phone) {
              const phone = t.phone.replace(/[^\w]/gi, '').trim();
              return phone === contactPhoneNo;
            }
          });
          if (contactDetails) {
            this.selectValue(contactDetails);
          }
        } else if (this.contactPersonData && this.contactPersonData.length === 1) {
          const contactDetails = JSON.parse(JSON.stringify(this.contactPersonData[0]));
          this.selectValue(contactDetails);
        }

        // else if (this.contactPersonData && this.contactPersonData.length > 0) {
        //   let contactDetails = JSON.parse(JSON.stringify(this.contactPersonData[0]));
        //   this.selectValue(contactDetails);
        // }

        for (let i = 0; i < this.contactPersonData.length; i++) {

          if (this.contactPersonData[i].contactPersonName) {
            this.contactPersonFirstNameArray.push({ contactDetails: this.contactPersonData[i], name: this.contactPersonData[i].contactPersonName.split(',')[1].trim() });
          }
          if (this.contactPersonData[i].contactPersonName) {
            this.contactPersonLastNameArray.push({ contactDetails: this.contactPersonData[i], name: this.contactPersonData[i].contactPersonName.split(',')[0].trim() });
          }
          if (this.contactPersonData[i].phone) {
            this.contactPersonPhoneArray.push({ contactDetails: this.contactPersonData[i], phone: this.contactPersonData[i].phone });
          }
          if (this.contactPersonData[i].email) {
            this.contactPersonEmailArray.push({ contactDetails: this.contactPersonData[i], email: this.contactPersonData[i].email });
          }
        }
        // if (this.countryname) {
        //   const index = this.country.findIndex(t => t.name === this.countryname.toLowerCase());
        //   if (index !== -1) {
        //     this.assignTrainnerForm.controls.countryDetails.setValue(this.country[index].id);
        //   }
        // }

        this.filterOnPersonFirstName('');
        this.filterOnPersonLastName('');
        this.filterOnPhoneNo('');
        this.filterOnEmail('');

      },
      error => {
        console.error('ERROR' + JSON.stringify(error));
      }
    );
  }

  /**
   * @author om kanada
   * @param value
   *          holds firstname value.
   * @description
   *         filter on person first name.
   * @memberof AssignTrainerComponent
   */
  public filterOnPersonFirstName(value: any): void {
    const filterValue = value ? value.toLowerCase() : '';
    const _oldContactPersonNameArray = JSON.parse(JSON.stringify((this.contactPersonFirstNameArray)));
    this.newContactPersonFirstNameArray = (value === '') ? this.contactPersonFirstNameArray : _oldContactPersonNameArray.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  /**
   * @author om kanada
   * @param value
   *      value holds last name.
   * @description
   *         filter on person last name.
   * @memberof AssignTrainerComponent
   */
  filterOnPersonLastName(value: any): void {
    const filterValue = value ? value.toLowerCase() : '';
    const _oldContactPersonNameArray = JSON.parse(JSON.stringify((this.contactPersonLastNameArray)));
    this.newContactPersonLastNameArray = (value === '') ? this.contactPersonLastNameArray : _oldContactPersonNameArray.filter(option => option.name.toLowerCase().includes(filterValue));


  }

  /**
   * @author om kanada
   * @param value
   *      value holds phone number.
   * @description
   *         filter on person phone number.
   * @memberof AssignTrainerComponent
   */
  filterOnPhoneNo(value: any): void {
    const filterValue = value;
    const _oldContactPersonPhoneArray = JSON.parse(JSON.stringify((this.contactPersonPhoneArray)));
    this.newContactPersonPhoneArray = (value === '') ? this.contactPersonPhoneArray : _oldContactPersonPhoneArray.filter(option => option.phone.includes(filterValue));


  }

  /**
   * @author om kanada
   * @param value
   *      value holds Email.
   * @description
   *         filter on person phone number.
   * @memberof AssignTrainerComponent
   */
  filterOnEmail(value: any): void {
    const filterValue = value ? value.toLowerCase() : '';
    let _oldContactPersonEmailArray = JSON.parse(JSON.stringify((this.contactPersonEmailArray)));
    this.newContactPersonEmailArray = (value === '') ? this.contactPersonEmailArray : _oldContactPersonEmailArray.filter(option => option.email.toLowerCase().includes(filterValue));

  }


  ngOnInit() {
    this.purposeList = this.data.data.purposeList;
    this.data = this.data.data;
    if (this.data && this.data.details) {
      this.slotDetails.date = this.data.details.date;
      this.exactDate = this.slotDetails.date;
      this.slotDetails.time = this.data.time;
      this.slotDetails.id = this.data.details.id;
      this.slotDetails.purpose = this.data.details.purpose;
      this.slotDetails.comment = this.data.details.comment;
      const countryDetailsData = this.systemConfig.getCountryDetail();
      for (const obj of countryDetailsData) {
        this.country.push({ id: obj.dialCode.replace(/[^\w]/gi, '').trim(), name: obj.countryName + ' ' + obj.dialCode });
      }
    }
    if (this.data.details.activityId) {
      this.getResponsiblePersonlookup();
      this.slotDetails.responsiblePerson_value = this.data.details.trainerId;
      this.disableSave = false;
    } else {
    }
    this.slotDetails.desiredTime = moment.tz(this.slotDetails.date + ' ' + this.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
    this.time = moment.tz(this.slotDetails.date + ' ' + this.slotDetails.time, 'YYYY-MM-DD hh:mm A', 'America/New_York').utc().format();
    if (this.isDSTFormat()) {
      this.time = moment(moment(this.time).format()).subtract({ 'hours': 4, minutes: (moment(this.time).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    } else {
      this.time = moment(moment(this.time).format()).subtract({ 'hours': 5, minutes: (moment(this.time).utcOffset() * 2) }).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }
    this.activeCallDetails = this.data.activeCallDetails;
    this.getCustomerData();
    this.initAssignTrainerForm();
    this.assignTrainnerForm.controls.responsiblePersonList.setValue(this.slotDetails.responsiblePerson_value);
    this.assignTrainnerForm.controls.countryCode.setValue(this.country[0].id);
    this.assignTrainnerForm.controls.time.setValue(this.time);
    if (this.slotDetails.comment !== null && this.slotDetails.comment !== undefined) {
      this.assignTrainnerForm.controls.comment.setValue(this.slotDetails.comment);
    }


  }

}
