// External imports
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef,OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import * as moment from 'moment';

// Internal imports
import { CustomerContactService } from "@app/customer/customer-contact/customer-contact.service";
import { DialogService, MessageService, PostalChannelService } from '@app/shared/services';
import { ContactDetailComponent } from '@app/contact/dialogs/contact-detail/contact-detail.component';
import { EmailChangeComponent } from '@app/contact/dialogs/email-change/email-change.component';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-customer-contact',
  templateUrl: './customer-contact.component.html',
  styleUrls: ['./customer-contact.component.scss'],
  providers: [CustomerContactService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerContactComponent implements OnInit,OnDestroy {
  @Input() customerID: string;
  @Input() isTestCustomer: string;
  @Input() isFromLicense: string;

  @Output() readContactId = new EventEmitter();
  @Output() contactListUpdated = new EventEmitter();

  public unsubscribeCustomerId:Subscription;
  //grid related variables
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public rowData = [this.domLayout = 'autoHeight'];
  public columnDefs: any;

  constructor(private cdr: ChangeDetectorRef, private dialogService: DialogService,
    private postalChannelService: PostalChannelService, private messageService: MessageService,
    private customerContactService: CustomerContactService, ) {
    let self = this;
    this.columnDefs = [
      {
        headerName: '',
        field: 'radio',
        width: 40, lockPosition: true, suppressMenu: true,
        cellClass: 'cursor_pointer',
        cellRenderer: function (param) {
          if (self.isFromLicense) {
            var ecell = document.createElement("input");
            ecell.type = "radio";
            ecell.name = "radioButton";
            ecell.value = param.node.data.radio;
            ecell.className = "cursor-pointer";
            if (self.rowData.length === 1) {
              ecell.checked = param.node.id
            }
            ecell.addEventListener("change", function (ev) {
              self.readContactId.emit(param.node.data);
            });
            return ecell;
          }
        }
      },
      {
        headerName: 'First Name', headerTooltip: 'firstName', field: 'firstName', //self.isFromLicense ? 500 : 150, 
        tooltipField: 'firstName',
        width: 200,
        lockPosition: true, suppressMenu: true, sortable: true,
      },
      { headerName: 'Last Name', headerTooltip: 'lastName', field: 'lastName', tooltipField: 'lastName', filter: true, width: 200, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Email', headerTooltip: 'email', field: 'email', tooltipField: 'email', filter: true, width: 350, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Telephone', headerTooltip: 'formtPhone', field: 'formtPhone', tooltipField: 'formtPhone', filter: true, width: 200, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Mobile', headerTooltip: 'Mobile', field: 'mobile', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true },
      {
        headerName: 'Reg. Date', headerTooltip: 'registrationDate', field: 'registrationDate', tooltipField: 'registrationDate',
        filter: true,
        width: 150,
        lockPosition: true,
        suppressMenu: true,
        sortable: true,
        cellRenderer: function (param) {
          return param.data.registrationDate ? moment(param.data.registrationDate).format("MM/DD/YYYY") : '';
        }
      },
      {
        headerName: 'Worng No.', headerTooltip: 'isWrongNumber', field: 'isWrongNumber', cellStyle: { textAlign: 'center' }, filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true,
        cellRenderer: (params) => {
          if (params.data.isWrongNumber === true) {
            return '<img src = "assets/images/Approved.png">';
          }
        }
      },
      {
        headerName: 'Invalid No.', headerTooltip: 'isInvalidNumber', cellStyle: { textAlign: 'center' }, field: 'isInvalidNumber', filter: true, width: 150, lockPosition: true, suppressMenu: true, sortable: true,
        cellRenderer: (params) => {
          if (params.data.isInvalidNumber === true) {
            return '<img src = "assets/images/Approved.png">';
          }
        }
      },
      {
        headerName: 'App User', headerTooltip: 'isAppUser', field: 'isAppUser', cellStyle: { textAlign: 'center' }, filter: true, width: 100, lockPosition: true, suppressMenu: true, sortable: true,
        cellRenderer: (params) => {
          if (params.data.isAppUser === true) {
            return '<img src = "assets/images/Approved.png">';
          }
        }
      },
      {
        headerName: '', field: 'isAppUser', tooltipField: "Change Email", cellStyle: { textAlign: 'center' }, filter: true, width: 40, lockPosition: true, suppressMenu: true, sortable: false, cellClass: 'ag-cell-tooltips',
        cellRenderer: (params) => {
          if (params.data.isAppUser === true) {
            let element = `<a class="ag-tooltip-wrap" ><i class="far fa-envelope font-15 cursor-pointer" title="Change Email" data-action-type="changeEmail"></i></a>`
            // let element = `<a data-action-type="changeEmail"><img src="assets/images/edit-email-address.png" title="Change Email" data-action-type="changeEmail"></a>`
            return element;
          }
        }
      },
      {
        headerName: "",
        field: "isMultipleContact",
        cellStyle: { textAlign: 'center' }, filter: true, width: 40, lockPosition: true, suppressMenu: true, sortable: false, cellClass: 'ag-cell-tooltips',
        cellRenderer: params => {
          if (params.value) {
            return '<i class="far fa-clone font-15 cursor-pointer" title="This Contact Card contains multiple contacts"></i>';
            //<img src = "assets/images/multiple-contacts.png" title="This Contact Card contains multiple contacts">
          }
        },
      },
      {
        headerName: "",
        field: "customerId",
        cellRenderer: params => {
          if (!params.data.isAppUser && !params.data.isVerifiedNumber) {
            let element = `<a ><i data-action-type="deleteContact" class="far fa-trash-alt cursor-pointer font-15" aria-hidden="true" title="Remove Contact" ></i></a>`
            return element;
          }
        },
        width: 40,
        sortable: false,
      }
    ]

  }

  // public gridOptions: GridOptions = {
  //   enableBrowserTooltips: true,
  // };

  onGridReady(params) {
    this.gridApi = params.api;
    if (!this.isFromLicense) {
      params.api.sizeColumnsToFit();
    }
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
  * @author Dhruvi Shah
  * @createdDate 06/12/2019
  @param {} e
  * @memberof CustomerContactComponent
  */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteContact":
          this.delete(e.data);
          break;
        case "changeEmail":
          this.changeEmail(e.data);
          break;
        default:
          if (e.event.target.type !== 'radio') {
            this.newCustomer(e.data);
          }
          break;
      }
    }
  }


  public newCustomer(contactRowData?) {
    this.dialogService.custom(ContactDetailComponent, { customerId: this.customerID, contactRowData: contactRowData, nextPrev: this.rowData }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((response) => {
      if (response !== true) {
        this.getContactPersonListData(response);
      }
    }, (error) => {
      console.error(error);
    });
  }

  public changeEmail(emailRowData?) {
    this.dialogService.custom(EmailChangeComponent, emailRowData, { keyboard: true, backdrop: 'static', size: 'md' }).result.then((response) => {
      if (response) {
        this.getContactPersonListData(response);
      }
    }, (error) => {
      console.error(error);
    });
  }

  private delete(contactData) {
    if (contactData) {
      const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to delete?' };
      this.dialogService.confirm(dialogData, {}).result.then((response) => {
        if (response === 'YES') {
          this.customerContactService.deleteContactDetail(contactData).then((result) => {
            this.messageService.showMessage('Contact deleted successfully', 'success');
            this.getContactPersonListData(contactData.customerId);
            this.cdr.detectChanges();
          }, error => {
            this.messageService.showMessage('Contact deleted unsuccessful', 'error');
            console.error(error);
          });
        }
        // this.rowData = response;
        // this.contactListUpdated.emit(response);
        // this.cdr.detectChanges();
      }, (error) => {
        console.error(error);
      });
    }
  }

  getContactPersonListData(id?: string) {
    if (id) {
      const object: any = { 'customerID': id };
      this.customerContactService.getContactPersonList(object).then((response: any) => {
        // console.log(response);
        for (let obj of response) {
          if (obj['phone'] !== undefined && obj['phone'] !== '') {
            obj['formtPhone'] = '(' + obj['phone'].slice(0, 3) + ') ' + obj['phone'].slice(3, 6) + '-' + obj['phone'].slice(6, 10);
          }
          if (obj['registrationDate'] !== undefined && obj['registrationDate'] !== '') {
            obj['registrationDatee'] = moment(obj['registrationDate']).format("MM/DD/YYYY");
          }
          if (this.isFromLicense) { obj['radio'] = true; }
        }
        this.rowData = response;
        this.contactListUpdated.emit(response);
        this.cdr.detectChanges();
      });
    }
  }

  ngOnInit() {
    this.unsubscribeCustomerId = this.postalChannelService.postalMessage$.subscribe((postalMsg) => {
      if (postalMsg.topic === 'contactGridRefereshData') { 
        this.getContactPersonListData(postalMsg.data);
      }
    });
  }

  ngOnChanges() {
    if (this.customerID) {
      this.getContactPersonListData(this.customerID);
    }
  }
  
  ngOnDestroy(){
    if(this.unsubscribeCustomerId)
    {
      this.unsubscribeCustomerId.unsubscribe();
    }
  }
}