// External Imports
import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';

// Internal Imports
import { MessageService } from '@app/shared/services';

@Component({
  selector: 'app-ticket-type-field-details',
  templateUrl: './ticket-type-field-details.component.html',
  styleUrls: ['./ticket-type-field-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketTypeFieldDetailsComponent implements OnInit, OnChanges {
  @Input() ticketTypeFieldData: any = {};
  @Output() ticketFieldDetailsSaved: EventEmitter<any> = new EventEmitter<any>();

  ticketTypeDetailsForm: FormGroup;
  public submitted = false;
  public typeList = [{ id: 'dropdown', name: 'Single Select' }, { id: 'multiselect', name: 'Multi Select' }];

  constructor(private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private messageservice: MessageService) { }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is use to create form  
  * @memberof ManageTicketTypeComponent
  */

  public createticketTypeDetailsForm() {
    this.ticketTypeDetailsForm = this.fb.group({
      id: this.fb.control('', [Validators.required]),
      inputType: this.fb.control('', [Validators.required]),
      isRequired: this.fb.control(false),
      isSelectAll: this.fb.control(false),
      completeOptionsList: this.fb.array([]),
      optionsList: this.fb.array([]),
      availableOptionsList: this.fb.array([]),
      default: this.fb.control([])
    });
    this.cdr.detectChanges();
  }

  /**
  * @author Sheo Ouseph
  * @created Date 08/08/2019
  * @returns void
  * @description this method is used to set the required field of the options list and available options list
  * @memberof ManageTicketTypeComponent
  */

  onRequiredChange(isChecked: boolean, item: any) {
    // const optionArray = this.ticketTypeDetailsForm.get('optionsList') as FormArray;
    // const availableOptionArray = this.ticketTypeDetailsForm.get('availableOptionsList') as FormArray;

    let completeOptionArray = this.ticketTypeDetailsForm.get('completeOptionsList').value;
    let completeOptionsArray = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;

    if (isChecked) {
      const index = completeOptionArray.findIndex(x => x.required == true && x !== item.value)
      if (index > -1 && this.ticketTypeDetailsForm.value.inputType == 'dropdown') {
        completeOptionsArray.value[index].required = false;
      }
      // completeOptionArray.removeAt(index);
      //completeOptionArray.push(this.setOptionList(item.value));
    } else {
      // const index = optionArray.controls.findIndex(x => x.value === item.value)
      // optionArray.removeAt(index);
      // availableOptionArray.push(this.setAvailableOptionList(item.value));

      const indexx = completeOptionArray.findIndex(x => x === item.value)
      completeOptionArray[indexx].required = false;
      completeOptionArray[indexx].default = false;
      this.ticketTypeDetailsForm.controls.isSelectAll.setValue(false)
    }
    completeOptionsArray.setValue(completeOptionArray)
    let noOptionRequired = true;
    for (let obj of this.ticketTypeDetailsForm.value.completeOptionsList) {
      if (obj.required) {
        noOptionRequired = false;
      }
    }
    if (noOptionRequired) {
      this.ticketTypeDetailsForm.controls['completeOptionsList'].setErrors({ 'required': true });
    } else {
      this.ticketTypeDetailsForm.controls['completeOptionsList'].setErrors(null);
    }
  }

  change() {
    let completeOptionArray = this.ticketTypeDetailsForm.get('completeOptionsList').value;
    let completeOptionsArray = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;

    if (this.ticketTypeDetailsForm.value.inputType == 'dropdown') {
      for (var i = 0; i <= completeOptionArray.length; i++) {
        completeOptionArray[i].required = false;
        completeOptionsArray.setValue(completeOptionArray);
      }
    }
  }
  onDefaultChange(isChecked: boolean, item: any) {
    if (this.ticketTypeDetailsForm.value.inputType == 'dropdown') {
      let completeOptionArray = this.ticketTypeDetailsForm.get('completeOptionsList').value;
      let completeOptionsArray = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;

      if (isChecked) {
        const index = completeOptionsArray.value.findIndex(x => x.default == true && x !== item.value);
        if (index > -1) {
          completeOptionsArray.value[index].default = false;
          completeOptionsArray.setValue(completeOptionArray)
          this.cdr.detectChanges();
        }
      }
    }
  }

  onInputTypeChange(event) {
    if (event.currentTarget.selectedIndex == 0) {
      let completeOptionArray = this.ticketTypeDetailsForm.get('completeOptionsList').value;
      let completeOptionsArray = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;
      for (let obj of completeOptionArray) {
        obj.default = false;
      }
      completeOptionsArray.setValue(completeOptionArray)
      this.cdr.detectChanges();
    }
  }

  /**
  * @author Sheo Ouseph
  * @created Date 08/08/2019
  * @returns void
  * @description this method is used to set the required field of the options list and available options list
  * @memberof ManageTicketTypeComponent
  */

  onSelectAllChange(isChecked: boolean) {
    // let optionArray = this.ticketTypeDetailsForm.get('optionsList') as FormArray;;
    // let availableOptionArray = this.ticketTypeDetailsForm.get('availableOptionsList') as FormArray;
    let completeOptionsArray = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;
    let completeOptionArray = this.ticketTypeDetailsForm.get('completeOptionsList').value;
    let noOptionIsRequired = true
    if (isChecked) {
      for (let obj of completeOptionArray) {
        obj.required = true;
        noOptionIsRequired = false
      }
    } else {
      for (let obj of completeOptionArray) {
        obj.required = false;
        obj.default = false;
        noOptionIsRequired = true;
      }
    }
    completeOptionsArray.setValue(completeOptionArray)
    if (noOptionIsRequired) {
      this.ticketTypeDetailsForm.controls['completeOptionsList'].setErrors({ 'required': true });
    } else {
      this.ticketTypeDetailsForm.controls['completeOptionsList'].setErrors(null);
    }
  }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is get form control value 
  * @memberof ManageTicketTypeComponent
  */

  get ticketTypeDetailsFormValue() { return this.ticketTypeDetailsForm.controls; }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is use to save data
  * @memberof ManageTicketTypeComponent
  */

  save() {
    this.submitted = true;
    let saveObject;
    let optionRequired = false;
    saveObject = this.ticketTypeDetailsForm.value;
    delete saveObject.isSelectAll;
    if ((this.ticketTypeDetailsForm.value.inputType == 'dropdown' || this.ticketTypeDetailsForm.value.inputType == 'multiselect') && this.ticketTypeDetailsForm.value.optionsList.length == 0) {
      saveObject.availableOptionsList = [];
      saveObject.optionsList = [];
      for (let obj of saveObject.completeOptionsList) {
        if (obj.required) {
          optionRequired = true;
          saveObject.optionsList.push(obj);
        } else {
          saveObject.availableOptionsList.push(obj);
        }
      }
      if (!optionRequired) {
        this.ticketTypeDetailsForm.controls['completeOptionsList'].setErrors({ 'required': true });
      }

    }
    if (this.ticketTypeDetailsForm.valid) {
      this.ticketFieldDetailsSaved.emit(this.ticketTypeDetailsForm.value)
    }
  }

  ngOnInit() {
  }

  setOptionList(obj?): FormGroup {
    return this.fb.group({
      key: obj ? obj.key : '',
      value: obj ? obj.value : '',
      required: obj ? true : false,
      default: obj ? obj.default : false
    });
  }

  setAvailableOptionList(obj?): FormGroup {
    return this.fb.group({
      key: obj ? obj.key : '',
      value: obj ? obj.value : '',
      required: false,
      default: false
    });
  }


  ngOnChanges(changes) {
    if (changes.ticketTypeFieldData.currentValue && Object.keys(changes.ticketTypeFieldData.currentValue).length > 0) {
      this.createticketTypeDetailsForm();
      this.ticketTypeDetailsForm.patchValue(this.ticketTypeFieldData);

      let completeOptionsList = this.ticketTypeDetailsForm.get('completeOptionsList') as FormArray;
      for (let obj in changes.ticketTypeFieldData.currentValue.optionList) {
        completeOptionsList.push(this.setOptionList({ key: obj, value: changes.ticketTypeFieldData.currentValue.optionList[obj], default: (changes.ticketTypeFieldData.currentValue.default && changes.ticketTypeFieldData.currentValue.default.findIndex(t => t === obj) > -1) ? true : false }));
      }

      for (let obj in changes.ticketTypeFieldData.currentValue.availableOptionList) {
        completeOptionsList.push(this.setAvailableOptionList({ key: obj, value: changes.ticketTypeFieldData.currentValue.availableOptionList[obj] }));
      }

    }
    this.cdr.detectChanges();
  }
}

// Pipes filtered keys of activity types
@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
  transform(value: any, args: string[]): any {
    const keys = [];
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }
}