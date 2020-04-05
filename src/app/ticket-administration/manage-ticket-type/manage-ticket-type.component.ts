import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, OnChanges, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { MessageService, DialogService, CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-manage-ticket-type',
  templateUrl: './manage-ticket-type.component.html',
  styleUrls: ['./manage-ticket-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTicketTypeComponent implements OnInit {
  ticketTypeDetailsForm: FormGroup;
  public selectedTicketTypeFieldList: any = [];
  public availableTicketTypeFieldList: Array<any> = [];
  public ticketTypeId: string;
  public ticketTypeDepartment: string;
  public ticketTypeData;
  public ticketTypeFieldData;
  public mode = false;
  public submitted = false;
  public departmentList = [{ key: 'development', name: 'Development' },{ key: 'sales', name: 'Sales' }, { key: 'setup', name: 'Setup' },
  { key: 'support', name: 'Support' }, { key: 'renew', name: 'Renew' }];
  public status = [{ id: 0, name: 'Active' }, { id: 1, name: 'Inactive' }];

  constructor(private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonAPIService: CommonApiService,
    private dialogservice: DialogService,
    private fb: FormBuilder,
    private messageservice: MessageService,
    private viewContainerRef: ViewContainerRef) { }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is used to create form
  * @memberof ManageTicketTypeComponent
  */

  public createticketTypeDetailsForm() {
    this.ticketTypeDetailsForm = this.fb.group({
      id: this.fb.control(''),
      department: this.fb.control({value:undefined,disabled: this.mode}, [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      whenToUse: this.fb.control(''),
      status: this.fb.control(0)
    });
  }

  /**
 * @author Satyam Jasoliya
 * @created Date 08/08/2019
 * @returns void
 * @description methodused to save the ticket type data
 * @memberof ManageTicketTypeComponent
 */
  saveTicketType(from) {
    this.submitted = true;
  
    if (this.ticketTypeDetailsForm.valid) {
      let ticketTypeObject = {};
      if (!this.mode) {
        from = 'allTicketDetails'
      }
      if (from == 'ticketDetails') {
        ticketTypeObject = {
          'department': this.ticketTypeDetailsForm.controls['department'].value,
          'status': this.ticketTypeDetailsForm.value.status,
          'name': this.ticketTypeDetailsForm.value.name,
          'whenToUse': this.ticketTypeDetailsForm.value.whenToUse
        };
      } else if (from == 'ticketFieldDetails') {
        ticketTypeObject = {
          'fieldList': this.selectedTicketTypeFieldList,
          'department': this.ticketTypeDetailsForm.controls['department'].value,
        };
      } else if (from == 'allTicketDetails') {
        ticketTypeObject = {
          'fieldList': this.selectedTicketTypeFieldList,
          'department': this.ticketTypeDetailsForm.controls['department'].value,
          'status': this.ticketTypeDetailsForm.value.status,
          'name': this.ticketTypeDetailsForm.value.name,
          'whenToUse': this.ticketTypeDetailsForm.value.whenToUse
        };
      }

      if (this.mode) { // update
        if ((from == 'ticketDetails' || from == 'allTicketDetails') && ticketTypeObject['department'] !== this.ticketTypeDepartment) {
          ticketTypeObject['oldDepartment'] = this.ticketTypeDepartment;
        }

        ticketTypeObject['id'] = this.ticketTypeId;
        this.commonAPIService.getPromiseResponse({ apiName: APINAME.UPDATE_TICKET_TYPE, parameterObject: ticketTypeObject }).then(response => {
          this.submitted = false;
          if (!this.mode) {
            this.messageservice.showMessage('Ticket Type Added Successfully', 'success');
          } else {
            this.messageservice.showMessage('Ticket Type Updated Successfully', 'success');
          }
          if (!this.mode || response.department !== this.ticketTypeDepartment) {
            return this.router.navigate(['ticket-admin', response.department, response.id]);
          } else {
            this.getTicketTypeDetails('save', from);
          }

        }, error => {
          this.messageservice.showMessage('Ticket Type updation Unsuccessful', 'error');
          console.error(error);
        });
      } else { // add
        this.commonAPIService.getPromiseResponse({ apiName: APINAME.INSERT_TICKET_TYPE, parameterObject: ticketTypeObject }).then(response => {
          //  this.submitted = false;
          if (response) {
            this.messageservice.showMessage('Ticket Type Added successfully', 'success');
            return this.router.navigate(['ticket-admin', response.department, response.id]);
          } else {
            this.messageservice.showMessage('Ticket Type added Unsuccessfully', 'error');
          }
          this.cdr.detectChanges();
        }, error => {
          this.messageservice.showMessage('error', 'error');
          console.error(error);
        });
      }
    }
  }

 

  /**
   * @author Satyam Jasoliya
   * @created Date 08/08/2019
   * @returns void
   * @description this method is used to delete form
   * @memberof ManageTicketTypeComponent
   */

  deleteTicketTypeList(): void {
    const ticketTypeObject = { 'id': this.ticketTypeId, 'department': this.ticketTypeDepartment };
    const dialogData = { title: 'Confirmation', text: 'Are you sure you want to delete the Ticket Type?' };
    this.dialogservice.confirm(dialogData, {}).result.then((dialogresponse) => {
      if (dialogresponse === 'YES') {
        this.commonAPIService.getPromiseResponse({ apiName: APINAME.DELETE_TICKET_TYPE, parameterObject: ticketTypeObject }).then(response => {
          this.router.navigate(['ticket-admin', 'ticketType']);
          this.messageservice.showMessage('Ticket Deleted successfully', 'success');
          this.cdr.detectChanges();
        }, error => {
          this.messageservice.showMessage('Ticket Delete Unsuccessfully', 'error');
          console.error(error);
        });
      }
    });
  }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is used to get ticket type details based on type ID and type department
  * @memberof ManageTicketTypeComponent
  */
  getTicketTypeDetails(when, forType?) {
    const ticketTypeObject = { 'id': this.ticketTypeId, 'department': this.ticketTypeDepartment };
    this.commonAPIService.getPromiseResponse({ apiName: APINAME.GET_TICKET_TYPE_DETAIL, parameterObject: ticketTypeObject }).then(response => {
      if (response) {
        this.ticketTypeData = response;
        if (forType == 'ticketFieldDetails' || forType == 'allTicketDetails' || when == 'init') {
          let availableFieldListArray = [];
          let fieldListArray = [];
          if (response.availableFieldList) {
            for (const key in response.availableFieldList) {
              if (response.availableFieldList.hasOwnProperty(key)) {
                availableFieldListArray.push(response.availableFieldList[key]);
              }
            }
          }
          if (response.fieldList) {
            for (const key in response.fieldList) {
              if (response.fieldList.hasOwnProperty(key)) {
                fieldListArray.push(response.fieldList[key]);
              }
            }
          }
          this.availableTicketTypeFieldList = availableFieldListArray;
          this.selectedTicketTypeFieldList = fieldListArray;
        }
        if (forType == 'ticketDetails' || forType == 'allTicketDetails' || when == 'init') {
          this.updateTicketDetails();
        }
        this.cdr.detectChanges();
      }
    }, error => {
      console.error(error);
    });
  }

  getAvailableFieldDetails() {
    this.commonAPIService.getPromiseResponse({ apiName: APINAME.GET_AVAILABLE_TICKET_TYPE_FIELDS, parameterObject: {} }).then(response => {
      if (response) {
        // this.availableTicketTypeFieldList = response;
        for (let obj of response) {
          if (obj.inputType == 'dropdown') {
            obj.inputType = 'multiselect';
          }
        }
        this.selectedTicketTypeFieldList = response;
      } this.cdr.detectChanges();
    }, error => {
      console.error(error);
    });
  }
  /**
   * @author Satyam Jasoliya
   * @created Date 08/08/2019
   * @returns void
   * @description this method is used to fill data
   * @memberof ManageTicketTypeComponent
   */
  updateTicketDetails() {
    this.ticketTypeDetailsForm.patchValue(this.ticketTypeData);
  }

  /**
 * @author Satyam Jasoliya
 * @created Date 08/08/2019
 * @returns void
 * @description this method is store child data in variable(EventEmitter)
 * @memberof ManageTicketTypeComponent
 */

  ticketdata(data: any) {
    this.ticketTypeFieldData = data;
  }

  /**
 * @author Sheo Ouseph
 * @created Date 14/08/2019
 * @returns void
 * @description this method is used to set the optionList of the type field and save the changes for the same Ticket Type
 * @memberof ManageTicketTypeComponent
 */
  ticketFieldDetailsSaved(event): void {
    if (event) {
      for (let obj of this.selectedTicketTypeFieldList) {
        if (obj.id == event.id) {
          let defaultList = [];
          let optionsList = {};
          for (let opt of event.optionsList) {
            optionsList[opt.key] = opt.value
            if (opt.default) {
              defaultList.push(opt.key);
            }
          }
          obj.optionList = optionsList;
          let availableOptionsList = {};
          for (let opt of event.availableOptionsList) {
            availableOptionsList[opt.key] = opt.value
          }
          obj.availableOptionList = availableOptionsList;
          obj.isRequired = event.isRequired;
          obj.inputType = event.inputType;
          obj.inputType = event.inputType;
          obj.default = defaultList;
          break;
        }
      }
      this.saveTicketType('ticketFieldDetails');
    }
  }

  ticketFieldListSaved(event: boolean) {
    if (event) {
      this.saveTicketType('allTicketDetails');
    }

  }

  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is navigate ticket administration component  
  * @memberof ManageTicketTypeComponent
  */
  public newTicketType(event: any): void {
    this.router.navigate(['ticket-admin', 'ticketType']);
  }


  /**
  * @author Satyam Jasoliya
  * @created Date 08/08/2019
  * @returns void
  * @description this method is use to get form control value  
  * @memberof ManageTicketTypeComponent
  */

  get ticketTypeDetailsFormValue() { return this.ticketTypeDetailsForm.controls; }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params && params.id && params.department) {
        this.ticketTypeId = params.id.toLowerCase();
        this.ticketTypeDepartment = params.department.toLowerCase();
        this.mode = true;
        this.getTicketTypeDetails('init');
      } else {
        this.getAvailableFieldDetails();
      }
    });
    this.createticketTypeDetailsForm();
  }
}
