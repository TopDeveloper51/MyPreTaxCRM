// External exports
import { Component, OnInit, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import * as moment from 'moment';
import * as _ from 'lodash';

// Internal exports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { DialogService, CDRService, MessageService } from '@app/shared/services';
import { KnowledgebaseComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/knowledgebase-detail/knowledgebase-detail.component';

@Component({
  selector: 'mtpo-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketDetailsComponent implements OnInit, OnChanges {
  @Input() modelData: any = {};
  @Input() originalTicketList: any = [];
  @Input('currentIndex') currentIndex;
  @Input('ticketDetails') ticketDetails: any;
  @Input('isSaveTicketClicked') isSaveTicketClicked: any;
  @Input('windowId') windowId: string;

  @Output('ticketDetailsChange') ticketDetailsChange: EventEmitter<any> = new EventEmitter<any>();
  public lookupNew: any = {};
  public lookup: any = {};
  public ticketList: any = [];
  // public preserveNotSavedticketList: any = [];
  public ticketID: string;
  public showLoading: boolean;
  public ticketTypeControls: any = [];
  public ticketDetailsForm: FormGroup;
  public ticketTypeListLookup = [];
  public errorTypeList = [];
  public followUpYearPeriod = [{ id: '2017', name: '2017' }, { id: '2018', name: '2018' }, { id: '2019', name: '2019' }, { id: '2020', name: '2020' }];
  public followUpMonthPeriod = [{ id: 'Jan', name: 'Jan' }, { id: 'Feb', name: 'Feb' }, { id: 'Mar', name: 'Mar' }, { id: 'Apr', name: 'Apr' }, { id: 'May', name: 'May' }, { id: 'Jun', name: 'Jun' }, { id: 'Jul', name: 'Jul' }, { id: 'Aug', name: 'Aug' }, { id: 'Sep', name: 'Sep' }, { id: 'Oct', name: 'Oct' }, { id: 'Nov', name: 'Nov' }, { id: 'Dec', name: 'Dec' }];
  private integrityServiceSubscription: Subscription;
  public knowledgeBase = [];
  public errorTypeOther = false;
  public isArchivedTicketType = false;
  public isTicketFormValid = false;
  public deptName: any;
  public fieldListLookup: any;
  public typeFieldList: any = [];
  public ticketTypeDetailsObj: any = {};
  public newTicketTypeList: any;
  public seasonReadiness: any; // to hold controls when ticket type is selected as setup
  public isSeasonReadiness = false;
  public isShowTrainingNotNeeded = false;
  public isShowConversionNotNeeded = false;
  public isShowoneOnOneStatus = false;
  public isShowGroupStatus = false;
  public oneOnOneStatusLookup = [];
  public groupStatusLookup = [];
  public isTicketNotLinked: boolean = false;
  public newTicketStatus: Array<boolean> = [];
  public valueListForForm: Array<any> = [];
  public isRemoveTicket = false;
  public noMigrated = false; // to set flag true when ticket is noMigrated
  constructor(private fb: FormBuilder,
    private ticketActivityDetailService: TicketActivityDetailService, private integrityService: TicketActivityIntegrityService,
    private dialogService: DialogService, private messageService: MessageService,
    private CDRService: CDRService, private cdr: ChangeDetectorRef) { }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description mark Select all in lookup
   * @param {*} lookupName
   * @memberof CustomerSearchComponent
   */
  public onSelectAll(multipleSelectfor, control?) {
    let selected;
    switch (multipleSelectfor) {
      case 'errorTypeArray':
        selected = [];
        selected = this.errorTypeList.map(
          item => item.id
        );
        this.ticketDetailsForm.get('errorTypeArray').patchValue(selected);
        break;
      case 'outcome':
        selected = [];
        selected = this.lookupNew.outComeTypeList.map(
          item => item.id
        );
        this.ticketDetailsForm.get('outcome').patchValue(selected);
        break;
      case 'resolution':
        selected = [];
        selected = this.lookupNew.resolutionList.map(
          item => item.id
        );
        this.ticketDetailsForm.get('resolution').patchValue(selected);
        break;
      case 'competitor':
        selected = [];
        selected = this.lookupNew.resolutionList.map(
          item => item.id
        );
        this.ticketDetailsForm.get('competitor').patchValue(selected);
        break;
      case 'packageType':
        selected = [];
        selected = this.lookupNew.resolutionList.map(
          item => item.id
        );
        this.ticketDetailsForm.get('packageType').patchValue(selected);
        break;
    }
    if (control) {
      selected = [];
      selected = control.valueList.map(
        item => item.id
      );
      this.ticketDetailsForm.controls.typeFieldDetails.get(multipleSelectfor).patchValue(selected);
    }
    this.CDRService.callDetectChanges(this.cdr);
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description clear selected val from lookup
   * @param {*} clearSelectfor
   * @memberof CustomerSearchComponent
   */
  public onClearAll(clearSelectfor, control?) {
    if (control) {
      this.ticketDetailsForm.controls.typeFieldDetails.get(clearSelectfor).patchValue([]);
    } else {
      this.ticketDetailsForm.get(clearSelectfor).patchValue([]);
    }
    this.CDRService.callDetectChanges(this.cdr);
  }



  public initTicketDetailsForm(): void {
    this.ticketDetailsForm = this.fb.group({
      id: '',
      ticketNumber: '',
      typeId: [undefined, Validators.required],
      ticketStatus: [undefined, Validators.required],
      department: [undefined, Validators.required],
      year: [undefined, Validators.required],
      subType: [undefined],
      errorTypeOtherDesc: '',
      errorTypeArray: [undefined, Validators.required],
      description: '',
      outcome: [undefined],
      outcomeOtherDesc: '',
      resolution: [undefined],
      resolutionOtherDesc: '',
      followupMonth: null,
      followupYear: null,
      typeFieldDetails: this.fb.group({}),
      seasonReadinessGroup: this.fb.group({
        doNotSendEmail: '',
        doNotSendSMS: '',
        noConversionNeeded: '',
        login: '',
        bankEnrollment: '',
        conversion: '',
        conversionNotNeededReason: '',
        efile: '',
        payment: '',
        trainingGroup: '',
        trainingNotNeededReason: '',
        oneOnOneStatus: '',
        groupStatus: '',
      })
    });

    this.reactiveValueChange();
    this.CDRService.callDetectChanges(this.cdr);
  }

  reactiveValueChange() {
    this.ticketDetailsForm.valueChanges.subscribe(data => {
      if (this.currentIndex > -1 && this.ticketList.length > 0) {
        // this.preserveNotSavedticketList[this.currentIndex].id = data.id;
        this.ticketList[this.currentIndex].typeId = data.typeId;
        this.ticketList[this.currentIndex].ticketStatus = data.ticketStatus;
        this.ticketList[this.currentIndex].department = data.department;
        this.ticketList[this.currentIndex].year = data.year;
        this.ticketList[this.currentIndex].subType = data.subType;
        this.ticketList[this.currentIndex].errorTypeOtherDesc = data.errorTypeOtherDesc;
        this.ticketList[this.currentIndex].errorTypeArray = data.errorTypeArray;
        this.ticketList[this.currentIndex].description = data.description;
        this.ticketList[this.currentIndex].outcome = data.outcome;
        this.ticketList[this.currentIndex].outcomeOtherDesc = data.outcomeOtherDesc;
        this.ticketList[this.currentIndex].resolution = data.resolution;
        this.ticketList[this.currentIndex].resolutionOtherDesc = data.resolutionOtherDesc;
        this.ticketList[this.currentIndex].followupMonth = data.followupMonth;
        this.ticketList[this.currentIndex].followupYear = data.followupYear;
        // this.ticketList[this.currentIndex].seasonReadiness = data.seasonReadiness;
      }
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 23/12/2019
   * @description change ticket type data when department is change
   * @memberof TicketDetailsComponent
   */
  public ticketStatusChange(event) {
    this.isSeasonReadiness = false;
    this.integrityService.sendMessage({ channel: 'ticketSeasonReadiness', topic: 'seasonReadiness', data: this.isSeasonReadiness, id: this.modelData.id });
    this.ticketTypeListLookup = [];
    this.typeFieldList = [];
    this.ticketDetailsForm.controls.typeId.setValue([]);
    let typleList: any;
    for (const key in this.lookupNew.typeDefinationDetails) {
      if (event.name.toLowerCase() === key.toLowerCase()) {
        typleList = this.lookupNew.typeDefinationDetails[key].filter(t => t.status === 0);
        for (const type of typleList) {
          this.ticketTypeListLookup.push({ id: type.id, name: type.name });
        }

      }
    }
    this.ticketDetailsForm.controls.typeId.setValue([]);
    this.ticketDetailsForm.get('typeId').setValidators(Validators.required);
    this.ticketDetailsForm.controls.errorTypeArray.setValue([]);
    this.ticketDetailsForm.get('errorTypeArray').setValidators(Validators.required);
    this.ticketTypeControls = [];
    this.CDRService.callDetectChanges(this.cdr);

  }

  /**
   * @author Mansi Makwana
   * @createdDate 01/01/2020
   * @description this method is used to set validations fopr outcome and resolution feild when status is set to close
   * @memberof TicketDetailsComponent
   */
  public setValidationsforCloseStatus() {
    // when user select ticket status close or department support , set validators for outcome and resolution feilds
    if (this.ticketDetailsForm.controls.ticketStatus.value === '2') {
      // this.ticketDetailsForm.controls.outcome.setValue([null]);
      this.ticketDetailsForm.controls.outcome.setValidators(Validators.required);
      this.ticketDetailsForm.controls.outcome.setValue([]);
    }
    if (this.ticketDetailsForm.controls.ticketStatus.value === '2' && this.ticketDetailsForm.controls.department.value === 'Support') {
      this.ticketDetailsForm.controls.resolution.setValidators(Validators.required);
      this.ticketDetailsForm.controls.resolution.setValue([]);
    } else {
      this.ticketDetailsForm.controls.outcome.setErrors(null);
      this.ticketDetailsForm.controls.resolution.setErrors(null);
    }
    this.CDRService.callDetectChanges(this.cdr);


  }

  /**
   * @author Mansi Makwana
   * @createdDate 01/01/2020
   * @description change sub-type data when ticket type is change
   * @memberof TicketDetailsComponent
   */
  public onChangeTicketType(event): void {
    this.isSeasonReadiness = false;
    this.errorTypeList = [];
    this.typeFieldList = [];

    if (this.ticketDetailsForm.controls.department.value.toLowerCase() === 'setup' && this.ticketDetailsForm.controls.typeId.value === '495683de-3039-48d3-9cf2-e3ed18ba67c5') {
      this.ticketTypeControls = [];
    }
    const deptName = this.lookupNew.typeDefinationDetails[this.ticketDetailsForm.controls.department.value.toLowerCase()];
    const errorData = deptName.find(t => t.id === this.ticketDetailsForm.controls.typeId.value);
    if (errorData && errorData.status === 0) {
      if (errorData.subTypeList && errorData.subTypeList.length > 0) {
        errorData.subTypeList.forEach(t => {
          this.errorTypeList.push({ id: t.id, name: t.name });
        });
      }
      if (errorData.fieldList && errorData.fieldList.length > 0) {

        errorData.fieldList.forEach(t => {
          for (const data of this.fieldListLookup) {
            if (t.id === data.id) {
              data.default = t.default;
              data.isRequired = t.isRequired;
              data.removeOptions = t.removeOptions;
              if (t.inputType === 'multiselect') {
                data.inputType = t.inputType;
              } else if (t.inputType === 'dropdown') {
                data.inputType = t.inputType;
              }
              this.typeFieldList.push(data);
            }
          }
        });
        this.createDynamicForm(this.typeFieldList);
        // to send count of ticket typefeilds , to set dynamic height
        this.integrityService.sendMessage({ channel: 'ticket-type-feilds-count', topic: 'ticket-type-feilds-count', data: this.typeFieldList.length, id: this.modelData.id })
      }
    }
    this.errorTypeList = JSON.parse(JSON.stringify(this.errorTypeList));
    this.ticketDetailsForm.controls.errorTypeArray.setValue([]);
    this.ticketDetailsForm.get('errorTypeArray').setValidators(Validators.required);
    const self = this;
    setTimeout(function () {
      self.checkFormValidation();
    }, 500);
  }

  /**
   * @author Mansi Makwana
   * @createdDate 23/12/2019
   * @description  call when outcome or resolution  is changed
   * @memberof TicketDetailsComponent
   */
  onChangeOutComeorResolution(changes) {
    if (changes === 'outcome') {
      this.ticketDetails.outcomeOtherDesc = (this.ticketDetails.outcome && this.ticketDetails.outcome.indexOf('0') == -1) ? undefined : this.ticketDetails.outcomeOtherDesc;
    } else if (changes === 'resolution') {
      this.ticketDetails.resolutionOtherDesc = (this.ticketDetails.resolution && this.ticketDetails.resolution.indexOf('0') == -1) ? undefined : this.ticketDetails.resolutionOtherDesc;
    }
  }

  /**
   * @author Mansi Makwana
   * @createdDate 23/12/2019
   * @description  call when error type is changed
   * @memberof TicketDetailsComponent
   */

  public onChangeErrorType(): void {
    this.isSeasonReadiness = false;
    this.typeFieldList = [];

    const deptName = this.lookupNew.typeDefinationDetails[this.ticketDetailsForm.controls.department.value.toLowerCase()];
    const errorData = deptName.find(t => t.id === this.ticketDetailsForm.controls.typeId.value);
    // when ticket type and sub type value is 'setup'
    if (this.ticketDetailsForm.controls.typeId.value === '495683de-3039-48d3-9cf2-e3ed18ba67c5' && this.ticketDetailsForm.controls.errorTypeArray.value[0] === '5f55fb26-7be0-40ed-bcfa-3c9c3b1288c6') {
      this.isSeasonReadiness = true;
      this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 259, id: this.modelData.id });
      this.ticketTypeControls = [];
      this.integrityService.sendMessage({ channel: 'ticketSeasonReadiness', topic: 'seasonReadiness', data: this.isSeasonReadiness, id: this.modelData.id  });
    }
    let subTypeData: any;
    this.ticketDetailsForm.controls.errorTypeArray.value.forEach(element => {
      if (errorData && errorData.subTypeList) {
        subTypeData = errorData.subTypeList.find(t1 => t1.id === element);

        if (subTypeData) {
          const newSubTypeData: any = {};
          newSubTypeData.id = subTypeData.id;
          newSubTypeData.knowledgeBase = subTypeData.knowledgeBase && subTypeData.knowledgeBase !== undefined ? subTypeData.knowledgeBase : '';
          if (subTypeData.name && subTypeData.name !== '') {
            newSubTypeData.text = subTypeData.name;
          }
          const subType = this.ticketDetailsForm.controls.subType.value;
          this.ticketDetailsForm.controls.subType.value.forEach((element, index) => {
            if (!element.createdDate) {
              subType.splice(index, 1);
            }
          });
          subType.push(newSubTypeData);
          this.ticketDetailsForm.controls.subType.setValue(subType);
          if (subTypeData.knowledgeBase) {
            this.knowledgeBase.push({ displayText: subTypeData.text, knowledgeBase: subTypeData.knowledgeBase, isOpen: true });
          }
        }
      }
    });
    const self = this;
    setTimeout(function () {
      self.checkFormValidation();
    }, 500);
  }

  public openDialogKnowledgeBase() {
    this.dialogService.custom(KnowledgebaseComponent, this.knowledgeBase, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(response => {
    }, (error) => {
      console.log(error);
    });
  }

  /**
   * setTicketTypeLookup
   *
   * function to set the lookup values of the Ticket Type based on the selected department of the ticket
   */
  public setTicketTypeLookup() {
    let typleList = (this.ticketDetailsForm.controls.department.value) ? this.lookupNew.typeDefinationDetails[(this.ticketDetailsForm.controls.department.value).toLowerCase()].filter(t => t.status === 0) : this.lookupNew.ticketTypeList;
    const isExistsAsActiveType = typleList.findIndex(t => t.id === this.ticketDetailsForm.controls.typeId.value);
    if (isExistsAsActiveType == -1) {
      this.isArchivedTicketType = true;
    }
    if (this.ticketDetailsForm.controls.department.value) {
      this.ticketTypeListLookup = [];
      typleList = this.lookupNew.typeDefinationDetails[this.ticketDetailsForm.controls.department.value.toLowerCase()].filter(t => t.status === 0);
      for (const type of typleList) {
        this.ticketTypeListLookup.push({ 'id': type.id, 'name': type.name });
      }
    }
    if (this.ticketDetailsForm.controls.subType.value && this.ticketDetailsForm.controls.subType.value.length > 0) {
      const errorTypeArray = this.ticketDetailsForm.controls.subType.value.map(t => t.id);
      this.ticketDetailsForm.controls.errorTypeArray.setValue(errorTypeArray);
      for (const type of this.ticketDetailsForm.controls.subType.value) {
        if (type.id == '1') {
          this.errorTypeOther = true;
          this.ticketDetailsForm.controls.errorTypeOtherDesc.setValue(type.otherDesc);
          break;
        } else {
          this.errorTypeOther = false;
        }
        if (type.knowledgeBase) {
          this.knowledgeBase.push({ displayText: type.text, knowledgeBase: type.knowledgeBase, isOpen: true });
        }
      }
    } else {
      this.ticketDetailsForm.controls.errorTypeArray.setValue([]);
    }

    if (this.ticketDetailsForm.controls.typeId.value === '495683de-3039-48d3-9cf2-e3ed18ba67c5' && this.ticketDetailsForm.controls.errorTypeArray.value[0] === '5f55fb26-7be0-40ed-bcfa-3c9c3b1288c6') {
      this.isSeasonReadiness = true;
      if (this.ticketList[this.currentIndex].seasonReadiness && Object.keys(this.ticketList[this.currentIndex].seasonReadiness).length > 0) {
        this.setSeasonData(this.ticketList[this.currentIndex].seasonReadiness)
      }

      this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 259, id: this.modelData.id });
      this.integrityService.sendMessage({ channel: 'ticketSeasonReadiness', topic: 'seasonReadiness', data: this.isSeasonReadiness, id: this.modelData.id  });
    } else {
      this.isSeasonReadiness = false;
    }
    this.integrityService.sendMessage({ channel: 'ticketSeasonReadiness', topic: 'seasonReadiness', data: this.isSeasonReadiness, id: this.modelData.id  });

    if (this.ticketDetailsForm.controls.department.value) {
      const deptName = this.lookupNew.typeDefinationDetails[this.ticketDetailsForm.controls.department.value.toLowerCase()];
      let errorData: any;
      deptName.forEach(element => {
        if (element.id === this.ticketDetailsForm.controls.typeId.value) {
          errorData = element;
        }
      });

      if (errorData && errorData.status === 0) {
        if (errorData.subTypeList && errorData.subTypeList.length > 0) {
          this.errorTypeList = [];
          errorData.subTypeList.forEach(t => {
            this.errorTypeList.push({ id: t.id, name: t.name });
          });
        }
      }
    }
    this.checkFormValidation();
    this.CDRService.callDetectChanges(this.cdr);
    this.ticketTypeListLookup = JSON.parse(JSON.stringify(this.ticketTypeListLookup));
    if (this.ticketList[this.currentIndex]) {
      this.ticketDetailsForm.controls.typeId.setValue(this.ticketList[this.currentIndex].typeId);
      // const isExistsTicketType = this.ticketTypeListLookup.findIndex(t => t.id === this.ticketDetailsForm.controls.typeId.value);
      // if (isExistsTicketType === -1) {
      //   // to send flag true if ticket type is old , to disabled save button
      //   this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: true, id: this.modelData.id });
      //   this.messageService.showMessage(`'You can't assign old Ticket to selected activity. Please remove this ticket and create new ticket for same. '`, 'error');
      // } else {
      //   // to send flag true if ticket type is old , to disabled save button
      //   this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: false, id: this.modelData.id });
      // }
    }
  }

  filterSearch(value, control) {
    if (value.length >= 2) {
      control.valueList = this.valueListForForm.filter(obj => obj.name.toLowerCase().includes(value))
    } else {
      control.valueList = []
    }
  }


  // REACTIVE FORM CODE
  public createDynamicForm(controlType: any): void {
    this.ticketTypeControls = [];
    this.CDRService.callDetectChanges(this.cdr);
    this.ticketTypeControls = controlType;
    const controls = {};
    for (const obj of controlType) {
      obj.type = obj.type ? obj.type : obj.inputType;
      obj.valueList = obj.valueList ? obj.valueList : obj.optionList;
      // Set Validations
      const validations = [];
      if (obj.isRequired === true) {
        validations.push(Validators.required);
      }
      if (obj.minLength !== undefined && obj.minLength !== null && obj.minLength !== '') {
        validations.push(Validators.minLength(obj.minLength));
      }
      if (obj.maxLength !== undefined && obj.maxLength !== null && obj.maxLength !== '') {
        validations.push(Validators.maxLength(obj.maxLength));
      }
      if (obj.type === 'datepicker') {
        if (obj.default === 'today') {
          obj.default = moment().utc().format();
        }
        obj.displayText = obj.label;
      }
      if (obj.type === 'textbox') {
        controls[obj.name] = new FormControl(obj.default);
        obj.displayText = obj.label;
      }
      if (obj.type === 'multiselect') {
        obj.displayText = obj.label;
        const valueList = [];
        for (const key in obj.optionList) {
          valueList.push({ id: key, name: obj.optionList[key] });
        }
        if (obj.removeOptions && obj.removeOptions.length > 0) {
          for (let i = 0; i < obj.removeOptions.length; i++) {
            const index = valueList.findIndex(t => t.name === obj.removeOptions[i]);
            valueList.splice(index, 1);
          }
        }
        obj.valueList = valueList;
        // controls[obj.name] = new FormControl(obj.default);
      }
      if (obj.type === 'dropdown') {
        // obj.displayText = obj.default ? obj.default : obj.label;
        if (obj.id == "a3e22eca-769d-4441-b142-81acb9345ad1") {

          this.valueListForForm = [];
          for (const key in obj.optionList) {
            this.valueListForForm.push({ id: key, name: obj.optionList[key] });
          }

          obj.valueList = this.valueListForForm.filter(object => object.name.toLowerCase().includes(obj.default ? obj.default.toLowerCase() : undefined))

        } else {
          const valueList = [];
          for (const key in obj.optionList) {
            valueList.push({ id: key, name: obj.optionList[key] });
          }
          if (obj.removeOptions && obj.removeOptions.length > 0) {
            for (let i = 0; i < obj.removeOptions.length; i++) {
              const index = valueList.findIndex(t => t.name === obj.removeOptions[i]);
              valueList.splice(index, 1);
            }
          }
          obj.valueList = valueList;
        }

        // controls[obj.name] = new FormControl(obj.default);
      }
      if (validations.length === 1) {
        controls[obj.name] = new FormControl(obj.name, validations[0]);
        controls[obj.name] = new FormControl(obj.default, validations[0]);
      } else if (validations.length > 0) {
        // Binding Form Data Controls
        controls[obj.name] = new FormControl(obj.default, validations);
      } else {
        // Binding Form Data Controls
        controls[obj.name] = new FormControl(obj.default);
      }
      this.ticketDetailsForm.controls.typeFieldDetails = this.fb.group(controls);
      this.ticketList[this.currentIndex].typeFieldDetails = this.ticketDetailsForm.controls.typeFieldDetails.value;
      this.setFormControl();
    }
    this.CDRService.callDetectChanges(this.cdr);
  }

  public setFormControl() {
    this.ticketDetailsForm.controls.typeFieldDetails.valueChanges.subscribe(data => {
      // console.log(data);
      if (this.currentIndex > -1 && this.ticketList.length > 0) {
        const typeFieldDetail = {};
        for (const key in data) {
          const element = data[key];
          if (element !== null && element !== key) {
            typeFieldDetail[key] = element;
          }
        }
        this.ticketList[this.currentIndex].typeFieldDetails = typeFieldDetail;
        const self = this;
        self.checkFormValidation();
      }
      else {
        const typeFieldDetail = {};
        for (const key in data) {
          const element = data[key];
          if (element !== null && element !== key) {
            typeFieldDetail[key] = element;
          }
        }
        const self = this;
        self.checkFormValidation();
      }
    });
  }
  public checkFormValidation() {
    this.integrityService.sendMessage({ channel: 'ticket', topic: 'isTicketValid', data: this.ticketDetailsForm.valid, id: this.modelData.id });
  }

  setTicketTypeField() {
    if (this.ticketList[this.currentIndex].typeFieldDetails && this.ticketList[this.currentIndex].typeFieldDefinition.fields) {
      this.ticketList[this.currentIndex].typeFieldDefinition.fields.forEach(element => {
        if (this.fieldListLookup && this.fieldListLookup.length > 0) {
          for (const data of this.fieldListLookup) {
            if (element.id === data.id) {
              element = Object.assign(element, data);
              for (const key in this.ticketList[this.currentIndex].typeFieldDetails) {
                if (element.name === key) {
                  const value = this.ticketList[this.currentIndex].typeFieldDetails[key];
                  if (value !== null && value !== key) {
                    if (element.inputType === 'multiselect') {
                      element.default = value;
                    } else {
                      if (value && typeof (value) !== 'string') {
                        element.default = value[0];
                      } else {
                        element.default = value;
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          for (const key in this.ticketList[this.currentIndex].typeFieldDetails) {
            if (element.name === key) {
              const value = this.ticketList[this.currentIndex].typeFieldDetails[key];
              if (value !== null && value !== key) {
                if (element.inputType === 'multiselect') {
                  element.default = value;
                } else {
                  if (value && typeof (value) !== 'string') {
                    element.default = value[0];
                  } else {
                    element.default = value;
                  }
                }
              }
            }
          }
        }


      });
      this.createDynamicForm(this.ticketList[this.currentIndex].typeFieldDefinition.fields);
      // to send count of ticket typefeilds , to set dynamic height
      setTimeout(() => {
        this.integrityService.sendMessage({ channel: 'ticket-type-feilds-count', topic: 'ticket-type-feilds-count', data: this.ticketList[this.currentIndex].typeFieldDefinition.fields.length, id: this.modelData.id })
      }, 500);
    } else {
      if (this.lookupNew && this.lookupNew.typeDefinationDetails) {
        this.typeFieldList = [];
        if (this.ticketDetailsForm.controls.department.value) {
          const deptName = this.lookupNew.typeDefinationDetails[this.ticketDetailsForm.controls.department.value.toLowerCase()];
          const errorData = deptName.find(t => t.id === this.ticketDetailsForm.controls.typeId.value);
          if (errorData && errorData.status === 0) {
            if (errorData.subTypeList && errorData.subTypeList.length > 0) {
              errorData.subTypeList.forEach(t => {
                this.errorTypeList.push({ id: t.id, name: t.name });
              });
            }
            if (errorData.fieldList && errorData.fieldList.length > 0) {
              errorData.fieldList.forEach(t => {
                if (this.fieldListLookup && this.fieldListLookup.length > 0) {
                  for (const data of this.fieldListLookup) {
                    if (t.id === data.id) {
                      data.default = t.default;
                      data.isRequired = t.isRequired;
                      data.removeOptions = t.removeOptions;
                      if (t.inputType === 'multiselect') {
                        data.inputType = t.inputType;
                      } else if (t.inputType === 'dropdown') {
                        data.inputType = t.inputType;
                      }
                      this.typeFieldList.push(data);
                    }
                  }
                }
              });
              this.createDynamicForm(this.typeFieldList);
              // to send count of ticket typefeilds , to set dynamic height
              this.integrityService.sendMessage({ channel: 'ticket-type-feilds-count', topic: 'ticket-type-feilds-count', data: this.typeFieldList.length, id: this.modelData.id })
            }
          }
        }
      }

    }
    // }
    //  else {
    //   this.typeFieldList = [];
    //   // if (this.ticketList[this.currentIndex].typeFieldDetails && this.ticketList[this.currentIndex].typeFieldDefinition.fields) {
    //   //   this.ticketList[this.currentIndex].typeFieldDefinition.fields.forEach(element => {
    //   //     for (const key in this.ticketList[this.currentIndex].typeFieldDetails) {
    //   //       if (element.name === key) {
    //   //         const value = this.ticketList[this.currentIndex].typeFieldDetails[key];
    //   //         if (value !== null && value !== key) {
    //   //           if (element.inputType === 'multiselect') {
    //   //             element.default = value;
    //   //           } else {
    //   //             if (value && typeof (value) !== 'string') {
    //   //               element.default = value[0];
    //   //             } else {
    //   //               element.default = value;
    //   //             }
    //   //           }
    //   //         }
    //   //       }
    //   //     }
    //   //   });
    //   //   this.createDynamicForm(this.ticketList[this.currentIndex].typeFieldDefinition.fields);
    //   //   // to send count of ticket typefeilds , to set dynamic height
    //   //   this.integrityService.sendMessage({ channel: 'ticket-type-feilds-count', topic: 'ticket-type-feilds-count', data: this.ticketList[this.currentIndex].typeFieldDefinition.fields.length, id: this.modelData.id })
    //   // }
    // }
  }

  resetTypeFieldDetailValidations(obj: any) {
    for (let key in obj) {
      this.ticketDetailsForm.get('typeFieldDetails').get(key).setErrors(null);
    }
  }

  setTicketData(from?) {
    if (this.ticketList && this.ticketList.length > 0) {
      if (this.currentIndex > -1 && this.ticketID) {
        delete this.ticketList[this.currentIndex].ticketList;
        // this.preserveNotSavedticketList[this.currentIndex] = JSON.parse(JSON.stringify(this.ticketList[this.currentIndex]));
        let ticketDetails = JSON.parse(JSON.stringify(this.ticketList[this.currentIndex]))

        if (from && from !== 'ticket-self') {
          this.ticketDetailsForm.reset();
          this.resetTypeFieldDetailValidations(this.ticketDetailsForm.value.typeFieldDetails);
          // this.integrityService.sendMessage({ channel: 'ticket-self', topic: 'ticketID', data: this.ticketList[this.currentIndex].id, id: this.modelData.id })
        }

        this.ticketList[this.currentIndex] = ticketDetails;

        if (this.ticketList[this.currentIndex].seasonReadiness && Object.keys(this.ticketList[this.currentIndex].seasonReadiness).length === 0) {
          this.isSeasonReadiness = false;
        }
       
        


        // // check ticket type is old or new 
        // if (this.ticketDetailsForm.controls.typeId.value || this.ticketList[this.currentIndex].typeId) {
        //   if (this.ticketTypeListLookup && this.ticketTypeListLookup.length > 0) {
        //     const isExistsTicketType = this.ticketTypeListLookup.findIndex(t => t.id === this.ticketList[this.currentIndex].typeId);
        //     if (isExistsTicketType === -1) {
        //       // to send flag true if ticket type is old , to disabled save button
        //       this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: true, id: this.modelData.id });
        //       this.messageService.showMessage("'You can't assign old Ticket to selected activity. Please remove this ticket and create new ticket for same. '", 'error');
        //     } else {
        //       const newTicketList = [];
        //       // this will check either Ticket type feild is old or new
        //       for (const ticket of this.ticketList) {
        //         const isTicketNew = this.ticketTypeListLookup.filter(obj => obj.id === ticket.typeId);
        //         newTicketList.push(isTicketNew);
        //       }
        //       if (newTicketList && newTicketList.length === 0) {
        //         // if (newTicketList.length === 0) {
        //         // to send flag true if ticket type is old , to disabled save button
        //         this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: false, id: this.modelData.id });
        //       } else if (this.isRemoveTicket) {
        //         if (newTicketList.length > 0) {
        //           this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: false, id: this.modelData.id });
        //         } else {
        //           this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: true, id: this.modelData.id });
        //         }
        //       }
        //       else {
        //         // if (newTicketList.length > 0) {
        //         //   this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: false, id: this.modelData.id });
        //         // } else {
        //         //   this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: true, id: this.modelData.id });
        //         // }
        //       }

        //       // if (this.isRemoveTicket) {
        //       //   const index = newTicketList.indexOf(this.ticketList[this.currentIndex].typeId);
        //       //   if (index > -1) {
        //       //     newTicketList.splice(index, 1);
        //       //   }
        //       //   if (newTicketList.length === 0) {
        //       //     // to send flag true if ticket type is old , to disabled save button
        //       //     this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: true, id: this.modelData.id });
        //       //   } else {
        //       //     this.integrityService.sendMessage({ channel: 'isSaveDisabled', topic: 'isSaveDisabled', data: false, id: this.modelData.id });
        //       //   }
        //       // }
        //     }
        //   }
        // }
        this.ticketDetailsForm.patchValue(this.ticketList[this.currentIndex]);
        this.setTicketTypeField();
      } else {
        if (!this.ticketID && this.currentIndex > -1) {
          if (this.ticketList[this.currentIndex].id) {
            if (from && from !== 'ticket-self') {
              this.integrityService.sendMessage({ channel: 'ticket-self', topic: 'ticketID', data: this.ticketList[this.currentIndex].id, id: this.modelData.id })
            }
          }
          // this.preserveNotSavedticketList[this.currentIndex] = ((this.ticketList[this.currentIndex]));
          this.ticketDetailsForm.patchValue(this.ticketList[this.currentIndex]);

          if (this.ticketList[this.currentIndex].subType && this.ticketList[this.currentIndex].subType.length > 0) {
            let errorTypeId = this.ticketList[this.currentIndex].subType.map(t => t.id);
            this.ticketDetailsForm.controls.errorTypeArray.setValue(errorTypeId);
          }
          this.setTicketTypeField();
          this.CDRService.callDetectChanges(this.cdr);
        } else {
          if (this.ticketList[0].id) {
            if (from && from !== 'ticket-self') {
              this.ticketID = this.ticketList[0].id;
              this.currentIndex = 0;
              this.integrityService.sendMessage({ channel: 'ticket-self', topic: 'ticketID', data: this.ticketList[0].id, id: this.modelData.id });
            }
          }
          // this.preserveNotSavedticketList[0] = ((this.ticketList[0]));
          this.ticketDetailsForm.patchValue(this.ticketList[0]);

          if (this.ticketList[0].subType && this.ticketList[0].subType.length > 0) {
            let errorTypeId = this.ticketList[0].subType.map(t => t.id);
            this.ticketDetailsForm.controls.errorTypeArray.setValue(errorTypeId);
          }
          this.setTicketTypeField();
          this.CDRService.callDetectChanges(this.cdr);
        }
      }

      // if new ticket is associated to activity then filter the 'Ticket Type' dropdown based on department
      const ticketDetails = this.ticketList[this.currentIndex];
      if (!ticketDetails.id || (ticketDetails.currentIndex == undefined || ticketDetails.activityId.length == 0) || (ticketDetails.activityId && ticketDetails.activityId.length > 0)) {
        this.ticketTypeListLookup = [];
        let typleList: any;
        for (const key in this.lookupNew.typeDefinationDetails) {
          if (ticketDetails.department.toLowerCase() === key.toLowerCase()) {
            typleList = this.lookupNew.typeDefinationDetails[key].filter(t => t.status === 0);
            for (const type of typleList) {
              this.ticketTypeListLookup.push({ id: type.id, name: type.name });
            }
          }
        }
      } else {
        this.ticketTypeListLookup = this.ticketTypeListLookup ? this.ticketTypeListLookup : [];
      }
      if (this.ticketTypeListLookup && this.lookupNew.typeDefinationDetails) {
        this.setTicketTypeLookup();
      }

       // This will check that ticket is migrated or not , if not then show a message 
       if (this.ticketDetailsForm.controls.typeId.value || this.ticketList[this.currentIndex].typeId) {
        if (this.ticketTypeListLookup && this.ticketTypeListLookup.length > 0) {
          const isExistsTicketType = this.ticketTypeListLookup.findIndex(t => t.id === this.ticketList[this.currentIndex].typeId);
          if (this.ticketList[this.currentIndex].notMigrated && isExistsTicketType === -1) {
            this.messageService.showMessage('Ticket which you are referring to is still referring to Old Definition. Please change the Type/Sub type.', 'error')
          }
        }
      }
      setTimeout(() => {
        if (!this.newTicketStatus[this.currentIndex]) {
          this.ticketTypeDetailsObj = Object.assign({}, this.ticketTypeDetailsObj, JSON.parse(JSON.stringify(this.ticketDetailsForm.value)));
        } else {
          this.ticketTypeDetailsObj = {};
        }
      }, 100);

    } else {
      this.ticketDetailsForm.reset();
    }
  }

  cleanObject(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
        delete obj[propName];
      } else if (typeof obj[propName] === "object") {
        // Recurse here if the property is another object.
        this.cleanObject(obj[propName])
      }
    }
    return obj;
  }

  /**
   * @author Mansi Makwana
   * @createdDate 10/01/2020
   * @description  call when ticket type and sub type is set as setup
   * @memberof TicketDetailsComponent
   */
  public setSeasonData(seasonData: any) {
    this.isSeasonReadiness = true;
    if (seasonData.login) {
      this.ticketDetailsForm.get('seasonReadinessGroup').get('login').setValue(seasonData.login.status);
    }
    this.ticketDetailsForm.controls.seasonReadinessGroup.get('doNotSendEmail').setValue(seasonData.dontSendEmail);
    this.ticketDetailsForm.controls.seasonReadinessGroup.get('doNotSendSMS').setValue(seasonData.dontSendSMS);
    if (seasonData.conversion) {
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('noConversionNeeded').setValue(seasonData.conversion.noConversionNeeded);
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('conversion').setValue(seasonData.conversion.status);
      if (seasonData.conversion.status == 'Conversion not needed') {
        this.isShowConversionNotNeeded = true;
        this.ticketDetailsForm.controls.seasonReadinessGroup.get('conversionNotNeededReason').setValue(seasonData.conversion.reasonForNotNeeded);
      } else {
        this.isShowConversionNotNeeded = false;
        this.ticketDetailsForm.controls.seasonReadinessGroup.get('conversionNotNeededReason').setValue(undefined);
      }
    }
    if (seasonData.bankEnrollment) {
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('bankEnrollment').setValue(seasonData.bankEnrollment.status);
    }
    if (seasonData.efileReadiness) {
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('efile').setValue(seasonData.efileReadiness.status);
    }
    if (seasonData.payment) {
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('payment').setValue(seasonData.payment.status);
    }
    if (seasonData.training) {
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('trainingGroup').setValue(seasonData.training.group);
      this.ticketDetailsForm.controls.seasonReadinessGroup.get('trainingNotNeededReason').setValue(seasonData.training.reasonForNotNeeded);
      if (seasonData.training.group == "1on1 Training Needed") {
        this.ticketDetailsForm.controls.seasonReadinessGroup.get('oneOnOneStatus').setValue(seasonData.training.actualValue);
      } else if (seasonData.training.group == "Group Training Needed") {
        this.ticketDetailsForm.controls.seasonReadinessGroup.get('groupStatus').setValue(seasonData.training.actualValue);
      }
      this.trainingGroupChange({ name: seasonData.training.group })
    }
  }

  public trainingGroupChange(event) {
    if (event.name === 'Training not Needed') {
      this.isShowTrainingNotNeeded = true;
      this.isShowoneOnOneStatus = false;
      this.ticketDetailsForm.controls.seasonReadinessGroup.value.oneOnOneStatus = undefined;
      this.isShowGroupStatus = false;
      this.ticketDetailsForm.controls.seasonReadinessGroup.value.groupStatus = undefined;

    } else if (event.name === '1on1 Training Needed') {
      this.isShowoneOnOneStatus = true;
      this.isShowGroupStatus = false;
      this.ticketDetailsForm.controls.seasonReadinessGroup.value.groupStatus = undefined;
      this.isShowTrainingNotNeeded = false;
      if (this.lookupNew.trainingGroup) {
        this.oneOnOneStatusLookup = [];
        this.groupStatusLookup = [];
        for (const obj of this.lookupNew.trainingActualValues) {
          if (obj.group == '1on1 Training Needed') {
            this.oneOnOneStatusLookup.push({ id: obj.id, name: obj.name });
          }
        }
      }
    } else if (event.name === 'Group Training Needed') {
      this.isShowGroupStatus = true;

      this.isShowoneOnOneStatus = false;
      this.ticketDetailsForm.controls.seasonReadinessGroup.value.oneOnOneStatus = undefined;
      this.isShowTrainingNotNeeded = false;

      this.oneOnOneStatusLookup = [];
      this.groupStatusLookup = [];
      for (const obj of this.lookupNew.trainingActualValues) {
        if (obj.group == 'Group Training Needed') {
          this.groupStatusLookup.push({ id: obj.id, name: obj.name });
        }
      }
    }
  }

  /**
   * @author Mansi Makwana
   * @cretedDate 21-01-2020
   * @description send message for open create ticket dialog when user click on link 
   * @memberof TicketDetailsComponent
   */
  getActivityTicket() {
    this.integrityService.sendMessage({ channel: 'OpenDialogForCreateTicket', topic: 'OpenDialogForCreateTicket', data: this.isTicketNotLinked, id: this.modelData.id  });
  }

  /**
   * @author Mansi Makwana
   * @cretedDate 29-01-2020
   * @description send message for ticket not linked yet
   * @memberof TicketDetailsComponent
   */
  sendMessage() {
    this.integrityService.sendMessage({ channel: 'ticketNotLinkedyet', topic: 'ticketNotLinkedyet', data: this.isTicketNotLinked, id: this.modelData.id  });
  }

  /** Lifecycle hook called on first time initialization of the component */
  ngOnInit() {
    if (this.ticketList && this.ticketList.length === 0) {
      this.isTicketNotLinked = true;
      // send static height when no data in ticket
      this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
      // this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:786, id: this.modelData.id });
      // this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
      this.sendMessage();
    } else {
      this.isTicketNotLinked = false;
    }
    if (this.originalTicketList.ticketList) {
      this.ticketList = this.originalTicketList.ticketList;
      this.isTicketNotLinked = false;
      this.setTicketData();
      this.showLoading = false;
    }
    this.showLoading = true;
    this.initTicketDetailsForm();
    this.integrityServiceSubscription = this.integrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic == 'lookup') {
        this.lookupNew = msgObj.data;
        this.lookupNew.yearsListNew = this.lookupNew.yearsList.filter(t => t.id !== 'blank'); // to remove blank option from yearslist array
        this.setTicketData('ticket-self');
        if (this.ticketID) {
          this.showLoading = false;
        }
      }
      else if (msgObj.topic === 'removeTicket') {
        this.isRemoveTicket = true;

      }
      else if (msgObj.topic == 'ticketseasonReadiness') {
        this.seasonReadiness = msgObj.data;
        if (this.seasonReadiness) {
          this.setSeasonData(this.seasonReadiness);
        }
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic == 'ticketFieldList') {
          this.fieldListLookup = msgObj.data;
        } else if (msgObj.topic === 'ticketList') {
          this.ticketList = msgObj.data;
          this.ticketID = undefined;
          if (!this.ticketList || this.ticketList.length === 0) {
            this.isTicketNotLinked = true;
            this.integrityService.sendMessage({ channel: 'ticket', topic: 'ticketID', data: undefined, id: this.modelData.id });
            // send static height when no data in ticket
            // this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
          } else {
            this.isTicketNotLinked = false;
          }
          // this.setTicketData();
          if (this.lookupNew && Object.keys(this.lookupNew).length > 0) {
            this.showLoading = false;
          }
        } else if (msgObj.topic === 'ticketID') {
          this.ticketID = msgObj.data;
          if (!this.ticketID) {
            this.isTicketNotLinked = true;
            // send static height when no data in ticket
            // this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
            this.showLoading = false;
            this.currentIndex = -1;
            this.ticketDetailsForm.reset();
            this.ticketTypeDetailsObj = {};
          } else {
            this.isTicketNotLinked = false;
            this.showLoading = true;
            this.currentIndex = this.ticketList.findIndex(obj => obj.id === this.ticketID);
            this.setTicketData(msgObj.channel);
          }
          if (!this.ticketList || this.ticketList.length === 0) {
            this.isTicketNotLinked = true;
            // send static height when no data in ticket
            // this.integrityService.sendMessage({ channel: 'set-dynamic-height', topic: 'set-dynamic-height', data: 786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'set-chat-dynamic-height', topic: 'set-chat-dynamic-height', data:786, id: this.modelData.id });
            // this.integrityService.sendMessage({ channel: 'kendo-chat-dynamic-height', topic: 'kendo-chat-dynamic-height', data: 620, id: this.modelData.id });
          } else {
            this.isTicketNotLinked = false;
          }
          if (this.lookupNew && Object.keys(this.lookupNew).length > 0) {
            this.showLoading = false;
          }
        } else if (msgObj.topic === 'currentTicketIndex') {
          this.currentIndex = msgObj.data;
          this.isTicketNotLinked = false;
          this.setTicketData(msgObj.channel);
        } else if (msgObj.topic === 'newTicketStatus') {
          this.newTicketStatus = msgObj.data;
        } else if (msgObj.topic === 'saveTicket') {
          // if (this.ticketDetailsForm.valid) {
          const typeFieldDetail = {};
          for (const key in this.ticketDetailsForm.controls.typeFieldDetails.value) {
            const element = this.ticketDetailsForm.controls.typeFieldDetails.value[key];
            if (element !== null && element !== key) {
              typeFieldDetail[key] = element;
            }
          }
          const ticketDetails = this.ticketDetailsForm.value;
          ticketDetails.typeFieldDetails = typeFieldDetail;
          let windowData = { 'windowId': this.windowId, 'currentId': this.modelData.id }
          if (msgObj.data && msgObj.data.type) {
            ticketDetails['requestType'] = msgObj.data.type;
          }
          this.integrityService.sendMessage({ channel: 'ticket', topic: 'isTicketValid', data: this.ticketDetailsForm.valid, id: this.modelData.id });
          if (this.ticketDetailsForm.valid) {
            this.ticketActivityDetailService.saveTicketDetails(ticketDetails, msgObj.channel, windowData, msgObj.data.id);
          }
          // }
        } else if (msgObj.topic == 'save') {
          if (this.isTicketNotLinked) {
            this.ticketDetailsForm.controls.typeId.setErrors(null);
            this.ticketDetailsForm.controls.ticketStatus.setErrors(null);
            this.ticketDetailsForm.controls.department.setErrors(null);
            this.ticketDetailsForm.controls.year.setErrors(null);
            this.ticketDetailsForm.controls.subType.setErrors(null);
            this.ticketDetailsForm.controls.errorTypeArray.setErrors(null);
          } else {
            if (this.ticketDetailsForm.valid) {
              const typeFieldDetail = {};
              for (const key in this.ticketDetailsForm.controls.typeFieldDetails.value) {
                const element = this.ticketDetailsForm.controls.typeFieldDetails.value[key];
                if (element !== null && element !== key) {
                  typeFieldDetail[key] = element;
                }
              }
              // const ticketDetails = this.ticketDetailsForm.value;
              // ticketDetails.typeFieldDetails = typeFieldDetail;
              if (this.currentIndex !== -1 && this.ticketList && this.ticketList.length > 0) {
                this.ticketList[this.currentIndex].typeFieldDetails = typeFieldDetail;
              }
            }
          }
          // this.ticketDetailsForm.value.typeFieldDetails = this.ticketDetailsForm.controls.typeFieldDetails.value;
          this.ticketDetailsForm.updateValueAndValidity();
          this.cleanObject(this.ticketDetailsForm.value);
          this.cleanObject(this.ticketTypeDetailsObj);
          const hasChanges = !_.isEqual(this.isTicketNotLinked ? {} : this.ticketDetailsForm.value, this.ticketTypeDetailsObj);

          // added this code to send typefieldvalues in array although inputType is single select or
          // multiselect and also check that ticket type is new or old before save
          if (this.ticketList && this.ticketList.length > 0) {
            const isExistsTicketType = this.ticketTypeListLookup.findIndex(t => t.id === this.ticketDetailsForm.controls.typeId.value);
            if (isExistsTicketType === -1) {
              this.noMigrated = true;
              if (msgObj.data.type === 'Save') {
                this.messageService.showMessage('Ticket which you are referring to is still referring to Old Definition. Please change the Type/Sub type.', 'error')
              }
            } else {
              this.noMigrated = false;
              this.ticketList[this.currentIndex].notMigrated = false;
              if (this.ticketList[this.currentIndex].typeFieldDetails && Object.keys(this.ticketList[this.currentIndex].typeFieldDetails).length > 0) {
                for (const key in this.ticketList[this.currentIndex].typeFieldDetails) {
                  const element = this.ticketList[this.currentIndex].typeFieldDetails[key];
                  if (element !== null && element !== key) {
                    if (element && typeof (element) === 'string') {
                      this.ticketList[this.currentIndex].typeFieldDetails[key] = [element];
                    } else {
                      this.ticketList[this.currentIndex].typeFieldDetails[key] = element;
                    }
                  }
                }
              }
            }
          }
          if (!this.noMigrated) {
            this.integrityService.sendMessage({ channel: 'ticketDetails', topic: 'saveData', data: { isValid: this.ticketDetailsForm.valid, requestType: msgObj.data.type, hasChanges: hasChanges, ticketDetails: this.ticketList, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
          }

        }
      } else {
        this.isRemoveTicket = false;
      }
    });
    this.CDRService.callDetectChanges(this.cdr);
  }

  /** Lifecycle hook called when component is destroyed */
  ngOnDestroy() {
    if (this.integrityServiceSubscription) {
      this.integrityServiceSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  // ngDoCheck() {
  //   console.log('TicCheck2')
  // }
}
