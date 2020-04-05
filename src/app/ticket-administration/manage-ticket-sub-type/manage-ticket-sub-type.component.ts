// external imports
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// internal imports
import { MessageService, DialogService, CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-manage-ticket-sub-type',
  templateUrl: './manage-ticket-sub-type.component.html',
  styleUrls: ['./manage-ticket-sub-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTicketSubTypeComponent implements OnInit {
  manageTicketSubTypeForm: FormGroup;
  ManageTicketSubTypeValue: any = {};
  statusList = [{ id: 0, name: 'Active' }, { id: 1, name: 'Inactive' }]
  public ticketSubTypeId;
  public ticketSubTypeDept;
  public ticketTypeId;
  public ticketSubTypeDetails;
  public mode = false;
  submitted = false;
  public ticketSubTypeData;
  public ticketSubtypeDataResponse;
  private viewContainerRef: ViewContainerRef;
  public ticketTypeFieldListData = [];
  public getManageTicketSubTypeResponseData;
  public ticketTypeName: string;
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef, private router: Router,
    private dialogservice: DialogService, private fb: FormBuilder,
    private commonApiService: CommonApiService,
    // private gRPCCommonAPIService: GRPCCommonAPIService,
    private messageservice: MessageService) { }


  /**
  * @author Pearly Shah
  * @createdDate 08/08/2019
  * @description create Manage Ticket SubType Form
  * @memberOf ManageTicketSubTypeComponent
  */

  public createManageTicketSubTypeForm() {
    this.manageTicketSubTypeForm = this.fb.group({
      id: this.fb.control(''),
      name: this.fb.control('', [Validators.required]),
      whenToUse: this.fb.control(''),
      status: this.fb.control(0)
    });
  }

  /**
    * @author Pearly Shah
    * @createdDate 08/08/2019
    * @description convenience getter for easy access to form fields 
    * @memberOf ManageTicketSubTypeComponent
    */

  get f() { return this.manageTicketSubTypeForm.controls; }


  /**
    * @author Pearly Shah
    * @createdDate 10/08/2019
    * @description Api call for save and edit
    * @memberOf ManageTicketSubTypeComponent
    */

  saveSubType() {
    this.submitted = true;
    if (this.manageTicketSubTypeForm.valid) {

      if (this.mode) {


        const dialogData = { title: 'Confirmation', text: 'Are you sure you want to save changes for this Ticket SubType?' };

        this.dialogservice.confirm(dialogData, {}).result.then((dialogResponse) => {
          if (dialogResponse == 'YES') {
            const ticketSubTypeObject = {
              'id': this.ticketSubTypeId, 'typeId': this.ticketTypeId, 'department': this.ticketSubTypeDept,
              'name': this.manageTicketSubTypeForm.value.name, 'status': this.manageTicketSubTypeForm.value.status,
              'whenToUse': this.manageTicketSubTypeForm.value.whenToUse, 'fieldList': this.ticketSubtypeDataResponse
            };
            this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_TICKET_SUB_TYPE, parameterObject: ticketSubTypeObject })
              .then(response => {
                this.submitted = false;
                this.messageservice.showMessage('Ticket SubType Updated Successfully', 'success');
                this.cdr.detectChanges();
              }, error => {
                this.messageservice.showMessage(error, 'error');
                console.error(error);
              });
          }
        });
      } else {
        const ticketSubTypeObject = {
          'id': this.ticketSubTypeId, 'typeId': this.ticketTypeId, 'department': this.ticketSubTypeDept,
          'name': this.manageTicketSubTypeForm.value.name, 'status': this.manageTicketSubTypeForm.value.status,
          'whenToUse': this.manageTicketSubTypeForm.value.whenToUse, 'fieldList': this.ticketSubtypeDataResponse
        };
        this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_TICKET_SUB_TYPE, parameterObject: ticketSubTypeObject })
          .then(response => {
            this.submitted = false;
            this.router.navigate(['ticket-admin', 'subtype-list', response.department, this.ticketTypeId, response.id]);
            this.messageservice.showMessage('Ticket SubType Added Successfully', 'success');
            this.cdr.detectChanges();
          }, error => {
            this.messageservice.showMessage(error, 'error');
            console.error(error);
          });
      }

    }
  }

  /**
    * @author Pearly Shah
    * @createdDate 08/08/2019
    * @description grid Data 
    * @memberOf ManageTicketSubTypeComponent
    */

  gridDataTicketSubType(event) {
    this.ticketSubTypeData = event;
  }
  /**
    * @author Pearly Shah
    * @createdDate 10/08/2019
    * @description  Api call for Delete ticket sub type
    * @memberOf ManageTicketSubTypeComponent
    */

  deleteTicketSubTypeList(): void {
    const ticketSubTypeObject = {
      'typeId': this.ticketTypeId, 'subTypeId': this.ticketSubTypeId,
      'department': this.ticketSubTypeDept
    };
    const dialogData = { title: 'Confirmation', text: 'Are you sure you want to delete the Ticket Type?' };
    this.dialogservice.confirm(dialogData, {}).result.then((dialogresponse) => {
      if (dialogresponse == 'YES') {
        this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_TICKET_SUBTYPE, parameterObject: ticketSubTypeObject })
          .then(response => {
            console.log('delete ticket', response);
            this.router.navigate(['ticket-admin', 'subtype-list', this.ticketSubTypeDept, this.ticketTypeId]);
            this.messageservice.showMessage('Ticket SubType Deleted Successfully', 'success');
            this.cdr.detectChanges();
          }, error => {
            this.messageservice.showMessage('Ticket SubType Deleted UnSuccessfully', 'error');
            console.error(error);
          });
      }
    });
  }


  /**
    * @author Pearly Shah
    * @createdDate 08/08/2019
    * @description redirect to ticket administration on back button
    * @memberOf ManageTicketSubTypeComponent
    */

  public newTicketType(): void {
    this.router.navigate(['ticket-admin', 'subtype-list', this.ticketSubTypeDept, this.ticketTypeId]);
  }


  /**
    * @author Pearly Shah
    * @createdDate 10/08/2019
    * @description Api call for get ticket sub type 
    * @memberOf ManageTicketSubTypeComponent
    */

  getSubType() {
    const ticketSubTypeObject = {
      'typeId': this.ticketTypeId, 'subTypeId': this.ticketSubTypeId,
      'department': this.ticketSubTypeDept
    };
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKET_SUB_TYPE_DETAILS, parameterObject: ticketSubTypeObject }).then(response => {
      console.log('ticket sub type field list', response);
      this.ticketSubtypeDataResponse = [];
      for (let obj in response.fieldList) {
        this.ticketSubtypeDataResponse.push(response.fieldList[obj])
      }
      this.getManageTicketSubTypeResponseData = response;
      this.updateTicketDetails();
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
    });
  }

  getType() {
    const ticketSubTypeObject = {
      'id': this.ticketTypeId, 'department': this.ticketSubTypeDept
    };
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TICKET_TYPE_DETAIL, parameterObject: ticketSubTypeObject }).then(response => {
      this.ticketTypeName = response.name;
      if (!this.mode) {
        this.ticketSubtypeDataResponse = [];
        for (let obj in response.fieldList) {
          this.ticketSubtypeDataResponse.push(response.fieldList[obj])
        }
      }
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
    });
  }


  /**
    * @author Pearly Shah
    * @createdDate 12/08/2019
    * @description patch value to form 
    * @memberOf ManageTicketSubTypeComponent
    */

  updateTicketDetails() {
    this.manageTicketSubTypeForm.patchValue(this.getManageTicketSubTypeResponseData);
  }

  ngOnInit() {
    this.createManageTicketSubTypeForm();
    this.route.params.subscribe(params => {
      this.ticketSubTypeDept = params.department;
      this.ticketTypeId = params.id;
      if (params.subid !== 'new') {
        this.ticketSubTypeId = params.subid;
        this.mode = true;
        this.getSubType();
      }
      this.getType();
    });
  }

}
