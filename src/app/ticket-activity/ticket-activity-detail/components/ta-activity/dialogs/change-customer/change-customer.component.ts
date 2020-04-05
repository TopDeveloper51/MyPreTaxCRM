import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';

// Internal imports
import { TicketActivityDetailService } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.service';
;
@Component({
  selector: 'mtpo-change-customer',
  templateUrl: './change-customer.component.html',
  styleUrls: ['./change-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TicketActivityDetailService]
})

export class ChangeCustomerComponent implements OnInit {
  public customerForm: FormGroup;
  public contactForm: FormGroup;
  private CustomerSearchCriteria: any = {};
  public CustomerSearchCriteriaForContact: any = {};
  //grid related variables
  public apiParam;
  public gridApi;
  public domLayout;
  public gridData: any;
  public gridColumnApi;
  public selectedRows;
  public rowData = [this.domLayout = 'autoHeight'];
  // clsCountryLookupData = [{ id: '', name: '' }, { id: 'abc', name: 'abc' }, { id: 'c', name: 'c' }, { id: 'd', name: 'd' }];
  public clsCountryLookupData = [];
  public clsStateLookupData = [];
  constructor(private modal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private ticketActivityDetailService: TicketActivityDetailService) { }

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: '', field: 'select', width: 150, lockPosition: true, suppressMenu: true, sortable: true,
        checkboxSelection: true,
        suppressMovable: true,
        // checkboxSelection: (params) => {
        //   console.log(params.data);
        //   const abcd = params.data.filter(obj => { if (obj.id === this.selectedRows[0].id) { return obj; } });
        //   if (abcd.isSelected === true || abcd.isSelected === false) {
        //     return false;
        //   }
        //   return true;
        // },
      },
      { headerName: 'Customer No.', headerTooltip: 'Customer Number', field: 'customerNumber', width: 150, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'Company Name', headerTooltip: 'Company Name', field: 'customerName', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Street', headerTooltip: 'Street', field: 'street', tooltipField: 'status', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true, },
      { headerName: 'Country', headerTooltip: 'Country', field: 'country', filter: true, width: 250, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'State', headerTooltip: 'State', field: 'state', filter: true, width: 200, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'ZipCode', headerTooltip: 'ZipCode', field: 'zipCode', filter: true, width: 200, lockPosition: true, suppressMenu: true, sortable: true },
      { headerName: 'City', headerTooltip: 'City', field: 'city', filter: true, width: 200, lockPosition: true, suppressMenu: true, sortable: true },
    ],
    enableBrowserTooltips: true,
  };

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridData = params.api;
    this.gridColumnApi = params.columnApi;
  }

  private customerFormData() {
    this.customerForm = this.fb.group({
      customerName: this.fb.control(''),
      street: this.fb.control(''),
      customerNumber: this.fb.control(''),
      city: this.fb.control(''),
      state: this.fb.control(undefined),
      country: this.fb.control(undefined),
      zipCode: this.fb.control('')
    });
  }

  private contactFormData() {
    this.contactForm = this.fb.group({
      email: this.fb.control(''),
      phone: this.fb.control('')
    });
  }

  public searchCustomer() {
    this.CustomerSearchCriteria = {
      CustomerID: "ea918b1c-597a-4c3a-9679-46f913a0646f",
      CustomerName: this.customerForm.get('customerName').value ? this.customerForm.get('customerName').value : undefined,
      Street: this.customerForm.get('street').value ? this.customerForm.get('street').value : undefined,
      CustomerNumber: this.customerForm.get('customerNumber').value ? this.customerForm.get('customerNumber').value : undefined,
      City: this.customerForm.get('city').value ? this.customerForm.get('city').value : undefined,
      State: this.customerForm.get('state').value ? this.customerForm.get('state').value : undefined,
      Country: this.customerForm.get('country').value ? this.customerForm.get('country').value : undefined,
      ZipCode: this.customerForm.get('zipCode').value ? this.customerForm.get('zipCode').value : undefined,
      pageNo: 1,
      pageSize: 50,
      sortDirection: "asc",
      sortExpression: "customerName"
    };
    this.ticketActivityDetailService.getCustomerList(this.CustomerSearchCriteria).then((response: any) => {
      this.rowData = response;
      this.cdr.detectChanges();
    });
  }

  public onSelectionChanged() {
    this.selectedRows = this.gridApi.getSelectedRows();
    this.selectedRows[0]['isSelected'] = true;
  }

  public searchCustomerAccordingContact() {
    this.CustomerSearchCriteriaForContact = {
      email: this.contactForm.get('email').value ? this.contactForm.get('email').value : undefined,
      telephone: this.contactForm.get('phone').value ? this.contactForm.get('phone').value : undefined,
      sortExpression: 'email',
      pageNo: 1,
      pageSize: 50,
      custSortExpression: 'customerName',
      sortDirection: 'asc'
    }
    this.ticketActivityDetailService.getCustomerListAccordingContactDetails(this.CustomerSearchCriteriaForContact).then((response: any) => {
      this.rowData = response;
      this.cdr.detectChanges();
    });
  }

  public moveToSelectedCustomer() {
    // this.selectedRows = this.gridApi.getSelectedRows();
    // this.selectedRows[0]['isSelected'] = true;
    // const selectedCustomer = this.selectedRows.find((t:any) => t.isSelected === true);
    const selectedCustomer = this.selectedRows;
    if (selectedCustomer) {
      this.modal.close(selectedCustomer);
    } else {
      // not selected message.
      // this.dialogService.notify('Attention', 'Please select any customer', {}, this.viewContainerRef)
      //     .subscribe((res) => {
      //     }, error => {
      //     });
      //    console.log('error');
    }
    this.cdr.detectChanges();
  }

  public getCountryCodeList() {
    this.clsCountryLookupData = [];
    this.ticketActivityDetailService.getCountryCodeList().then((response: any) => {
      this.clsCountryLookupData = response;
      this.cdr.detectChanges();
    });
  }

  public getStateCodeList() {
    this.clsStateLookupData = [];
    this.ticketActivityDetailService.getStateCodeList().then((response: any) => {
      response.filter(obj => { this.clsStateLookupData.push({ id: obj.value, name: obj.text }) });
      this.clsStateLookupData = response;
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();
  }

  public close(): void {
    this.modal.close();
    this.cdr.detach();
  }

  ngOnInit() {
    this.getCountryCodeList();
    this.customerFormData();
    this.contactFormData();
    this.getStateCodeList();

  }

}
