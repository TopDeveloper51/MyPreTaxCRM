// External imports
import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { MatDialogRef } from '@angular/material';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// Internal imports
import { MessageService, CommonApiService } from '@app/shared/services';
import { LoaderService } from '@app/shared/loader/loader.service';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-manage-field-list-form',
  templateUrl: './manage-field-list-form.component.html',
  styleUrls: ['./manage-field-list-form.component.css']
})
export class ManageFieldListFormComponent implements OnInit, OnDestroy {
  public data: any;
  public title = 'Add Manage Field'; // Set title
  public manageFieldList: any = {}; // To store api response data 
  public manageFieldListForm: FormGroup; // To intialize manage list form 
  exampleDataInputType: { id: string; name: string; dataTypeId: any }[]; // Demo lookup for inputType
  exampleDataDataType: { id: string; name: string; }[]; // Demo lookup for data type
  optionList: { id: string; name: string; }[];
  submitted = false; // To submit the form
  public store;
  public mode: boolean = false;



  constructor(
    private loader: LoaderService, public modal: NgbActiveModal,
    private commonApi: CommonApiService, private formBuilder: FormBuilder,
    private messageservice: MessageService, private cdr: ChangeDetectorRef) { }

  /**
  * @author om kanada
  * @createdDate 13/08/2019
  * @description initalize manage feild list form
  * @memberOf ManageFieldListFormComponent
  */
  private initManageFieldListForm(): void {

    this.manageFieldListForm = this.formBuilder.group({
      name: [null, Validators.required],
      label: [this.manageFieldList.label, Validators.required],
      tooltip: [this.manageFieldList.tooltip, Validators.required],
      inputType: [null, Validators.required],
      dataType: [null, Validators.required],
      // option: this.formBuilder.array([this.formBuilder.group({ key: [null, Validators.required], value: [null, Validators.required] })])
      option: this.formBuilder.array([this.formBuilder.group({ key: [], value: [] })])

    });
    this.manageFieldListFormdisabledcontrol();
    this.cdr.detectChanges();
  }

  private manageFieldListFormdisabledcontrol()
  {
    if(this.data.type === 'edit')
    {
      this.manageFieldListForm.disable();
      this.manageFieldListForm.controls['label'].enable();
      this.manageFieldListForm.controls['tooltip'].enable();
    }
  }

  private disableInputs() {
    (<FormArray>this.manageFieldListForm.get('option'))
      .controls
      .forEach((control:FormGroup) => {
        control.controls.key.disable();
      })
  }
  /**
  * @author om kanada
  * @createdDate 13/08/2019
  * @description Api call for get data from id
  * @memberOf ManageFieldListFormComponent
  */
  private getFieldDetailsFromFeildId(feildId: string): void {
    this.loader.show();
    this.commonApi.getPromiseResponse({ apiName: APINAME.GET_SELECTED_FIELD_DATA, parameterObject: { id: feildId } }).then(response => {
      if (response) {
        this.manageFieldList = response;
        this.reactive();
        this.loader.hide();
        this.cdr.detectChanges();
      }
    }, (error) => {
      this.messageservice.showMessage('Error', 'error');
    });
  }

  // convenience getter for easy access to form fields
  get manageFeildListFormValue() {
    return this.manageFieldListForm.controls;
  }


  get rawValue(){
    return this.manageFieldListForm.getRawValue();
  }

  get optionData() {
    return <FormArray>this.manageFieldListForm.get('option');
  }

  onDrop(event: CdkDragDrop<Object[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.manageFieldListForm.get('option').patchValue(event.container.data);
    this.cdr.detectChanges();
  }


  setValidators(): void {
    let data = this.manageFieldListForm.getRawValue()
    if (data.inputType == 'dropdown' || data.inputType == 'multiselect') {
      (<FormArray>this.manageFieldListForm.get('option')).controls.forEach(element => {
        element.get('key').setValidators([Validators.required]);
        element.get('value').setValidators([Validators.required]);
        element.get('key').updateValueAndValidity();
        element.get('value').updateValueAndValidity();
      });
    } else {
      (<FormArray>this.manageFieldListForm.get('option')).controls.forEach(element => {
        element.get('key').clearValidators();
        element.get('value').clearValidators();
        element.get('key').updateValueAndValidity();
        element.get('value').updateValueAndValidity();
      });
    }
  }

  /**
 * @author om kanada
 * @createdDate 13/08/2019
 * @description To save  & update manage feildlist formdata
 * @memberOf ManageFieldListFormComponent
 */
  save(): void {

    this.submitted = true;
    this.setValidators();   // set validation based on input type  
    if (this.manageFieldListForm.valid) {
      if (this.data.data && this.data.data.id) {
        const data = this.manageFieldListForm.getRawValue();
        data.id = this.data.data.id;
        data.optionList = {};
        data.option.forEach(element => {
          if (element.key) {
            data.optionList[element.key] = element.value;
          }
        });
        delete data.option;
        this.commonApi.getPromiseResponse({ apiName: APINAME.UPDATE_MANAGE_FIELD, parameterObject: data }).then(response => {
          this.messageservice.showMessage('Field Updated Successfully', 'success');
          this.modal.close(true);
        }, (error) => {
          this.messageservice.showMessage('Error while Update Field', 'error');
          this.modal.close();
        });
      } else {
        const data = this.manageFieldListForm.getRawValue();
        data.optionList = {};
        if (data.option && data.option.length > 0) {
          data.option.forEach(element => {
            if (element.key) {
              data.optionList[element.key] = element.value;
            }
          });
        }
        delete data.option;
        this.commonApi.getPromiseResponse({ apiName: APINAME.ADD_MANAGE_FIELD, parameterObject: data }).then(response => {
          this.messageservice.showMessage('Field Added Successfully', 'success');
          this.modal.close(true);
        }, (error) => {
          this.messageservice.showMessage('Field Added Unsuccessfully', 'error');
          this.modal.close();
        });

      }
    }
  }


  reactive() {
    this.manageFieldListForm.get('name').setValue(this.manageFieldList.name);
    this.manageFieldListForm.get('label').setValue(this.manageFieldList.label);
    this.manageFieldListForm.get('tooltip').setValue(this.manageFieldList.tooltip);
    this.manageFieldListForm.get('inputType').setValue(this.manageFieldList.inputType);
    this.manageFieldListForm.get('dataType').setValue(this.manageFieldList.dataType);
    if (this.manageFieldList) {
      if (this.manageFieldList.optionList) {
        this.options.removeAt(0);
        for (const Key in this.manageFieldList.optionList) {
          if (this.manageFieldList.optionList.hasOwnProperty(Key)) {
            const element = this.manageFieldList.optionList[Key];
            this.options.push(this.formBuilder.group({ key: Key, value: element }, [Validators.required]));
          }
        }
      }
    }
    if(this.data.type === 'edit')
    {
      this.disableInputs();
    }
    this.cdr.detectChanges();
  }

  click() {
    const data = [];
    for (let index = 0; index < this.exampleDataInputType.length; index++) {
      var id1 = this.exampleDataInputType[index].id;
      data.push(this.exampleDataInputType.find(i => i.dataTypeId[index] === id1));

    }
  }

  /**
* @author om kanada
* @createdDate 13/08/2019
* @description Demo data for input type
* @memberOf ManageFieldListFormComponent
*/
  getInputType(): void {
    this.exampleDataInputType = [
      {
        "id": "textbox",
        "name": "Textbox",
        "dataTypeId": ["text", "number"]
      },
      {
        "id": "checkbox",
        "name": "Checkbox",
        "dataTypeId": []
      },
      {
        "id": "datepicker",
        "name": "Datepicker",
        "dataTypeId": ["date", "time", "dateTime"]
      },
      {
        "id": "textarea",
        "name": "Textarea",
        "dataTypeId": ["text", "number"]
      },
      {
        "id": "dropdown",
        "name": "Dropdown",
        "dataTypeId": []
      }
    ];
  }


  /**
* @author om kanada
* @createdDate 13/08/2019
* @description Demo data for dataType
* @memberOf ManageFieldListFormComponent
*/
  getDataType(): void {
    this.exampleDataDataType = [
      {
        "id": "string",
        "name": "Text"
      },
      {
        "id": "number",
        "name": "Number"
      },
      {
        "id": "date",
        "name": "Date"
      },
      {
        "id": "time",
        "name": "Time"
      },
      {
        "id": "dateTime",
        "name": "DateTime"
      },
      {
        "id": "boolean",
        "name": "Boolean"
      }
    ];
  }


  setFormControlValues() {
    for (let id = 0; id < this.exampleDataInputType.length; id++) {
      this.store = this.exampleDataInputType[id].dataTypeId.find((i) => {
      })
    }
  }

  /**
* @author om kanada
* @createdDate 13/08/2019
* @description get method for options feild
* @memberOf ManageFieldListFormComponent
*/
  get options() {
    return this.manageFieldListForm.get('option') as FormArray;

  }
  /**
* @author om kanada
* @createdDate 13/08/2019
* @description when click on add icon add feilds in options
* @memberOf ManageFieldListFormComponent
*/
  addOptions(): void {
    this.options.push(this.formBuilder.group({ key: [null, Validators.required], value: [null, Validators.required] }));
  }
  /**
* @author om kanada
* @createdDate 13/08/2019
* @description when click on delete icon delete thet index feild
* @memberOf ManageFieldListFormComponent
*/
  deleteOptions(index: number): void {
    this.options.removeAt(index);
  }

  closeDialog(action?) {
    this.modal.close(action);
  }

  ngOnDestroy(): void {
    if (this.cdr) {
      this.cdr.detach();
    }
  }

  ngOnInit(): void {

    if (this.data.title) {
      this.title = this.data.title;
    }
   
    // initalize form 
    this.initManageFieldListForm();
    this.getInputType();
    this.getDataType();
    // get data From the dialog
    if (this.data.data && this.data.data.id) {
      this.mode = true;
      setTimeout(() => {
        this.getFieldDetailsFromFeildId(this.data.data.id); // call method when id is available  
      }, 0);

    }
  }
}
