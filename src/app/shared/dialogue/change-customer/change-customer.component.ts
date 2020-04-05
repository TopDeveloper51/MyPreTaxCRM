// external imports
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, _ } from 'ag-grid-community';

// internal imports
import { MessageService } from '@app/shared/services/message.service';
import { CDRService, CommonApiService, UserService } from '@app/shared/services';
import { APINAME } from '@app/activity/activity-constants';

@Component({
  selector: 'app-change-customer',
  templateUrl: './change-customer.component.html',
  styleUrls: ['./change-customer.component.scss']
})
export class ChangeCustomerComponent implements OnInit, OnDestroy {

  @Input() data: any; // input data for customer dialouge
  public changeCustomerForm: FormGroup; // contains change customer form
  public changeCustomerContactForm: FormGroup;  // contains change contact form
  public searchData: boolean; // search result for ag grid
  public isSearchByContactDetail: boolean;
  public searchResultsCustomer: any = {};

  // ag gird related variable declaration
  public getRowStyle: any;
  public sideBar: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: ColDef[];
  public defaultColDef: any;
  public rowData: any = [];


  constructor(public modal: NgbActiveModal, private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    private userService: UserService, private fb: FormBuilder) {

    //define ag grid columns
    this.columnDefs = [
      {
        headerName: "Select",
        width: 100,
        cellRenderer: function cellTitle(params) {
          const cellValue = '<div class="ngSelectionCell"><input name="selected" type="radio"></div>';
          return cellValue;
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: "Customer No.",
        field: "customerNumber",
        headerTooltip: "Type",
        tooltipField: "customerNumber",
        filter: "agTextColumnFilter",
        width: 200
      },
      {
        headerName: "Company Name",
        field: "customerName",
        headerTooltip: "Company Name",
        tooltipField: "customerName",
        filter: "agTextColumnFilter",
        width: 230
      },
      {
        headerName: "Street",
        field: "street",
        headerTooltip: "Street",
        tooltipField: "street",
        filter: "agTextColumnFilter",
        width: 250
      },
      {
        headerName: "Country",
        field: "country",
        headerTooltip: "Country",
        tooltipField: "country",
        filter: "agTextColumnFilter",
        width: 200
      },
      {
        headerName: "State",
        field: "state",
        headerTooltip: "State",
        tooltipField: "state",
        filter: "agTextColumnFilter",
        width: 200
      },
      {
        headerName: "ZipCode",
        field: "zipCode",
        headerTooltip: "ZipCode",
        tooltipField: "zipCode",
        filter: "agTextColumnFilter",
        width: 200
      },
      {
        headerName: "City",
        field: "city",
        headerTooltip: "City",
        tooltipField: "city",
        filter: "agTextColumnFilter",
        width: 200
      },
    ];
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      resizable: true,
      tooltip: (p: any) => {
        return p.value;
      },
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true,
    };
  }

  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {*} params
   * @memberof ChangeCustomerComponent
   */
  public moveToSelectedCustomer(): void {
    const selectedCustomer = this.gridApi.getSelectedRows();
    if (selectedCustomer && Object.keys(selectedCustomer).length > 0) {
      this.modal.close(selectedCustomer);
    } else {
      this.messageService.showMessage('Please select any customer', 'error');
    }
  }


  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {*} params
   * @memberof ChangeCustomerComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  // close the dailouge
  public close(data: any): void {
    this.modal.close();
  }

  // this function is use to save change customer data
  public Cancel() {
    this.modal.close();
  }

  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {}
   * @desc this method is use to search by customer email and phone
   * @memberof ChangeCustomerComponent
   */
  searchForContect(): void {

    this.rowData = [];
    this.searchData = true;
    let CustomerSearchCriteriaForContact: any = {};

    // json to pass in api
    CustomerSearchCriteriaForContact = {
      'sortExpression': 'email',
      'pageNo': 1,
      'pageSize': 20,
      'custSortExpression': '',
      'sortDirection': 'asc'
    };

    if (this.changeCustomerContactForm.controls.Email.value && this.changeCustomerContactForm.controls.Email.value !== '') {
      CustomerSearchCriteriaForContact.email = this.changeCustomerContactForm.controls.Email.value;
    }
    if (this.changeCustomerContactForm.controls.Phone.value && this.changeCustomerContactForm.controls.Phone.value !== '') {
      CustomerSearchCriteriaForContact.telephone = this.changeCustomerContactForm.controls.Phone.value;
    }

    // api call
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAIL_ACCORDING_TO_CONTACT_DETAIL, parameterObject: CustomerSearchCriteriaForContact }).then((response) => {
      this.isSearchByContactDetail = true;
      this.rowData = response;
      this.cdrService.callDetectChanges(this.cdr);
    });

  }

  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {}
   * @desc this method is use to search by customer name and number
   * @memberof ChangeCustomerComponent
   */
  searchForCustomer(): void {
    this.rowData = [];
    this.searchData = true;
    let CustomerSearchCriteria: any = {};
    CustomerSearchCriteria = {
      'sortExpression': 'customerName',
      'pageSize': 50,
      'pageNo': 1,
      'sortDirection': 'asc'
    };

    if (this.changeCustomerForm.controls.CustomerName.value && this.changeCustomerForm.controls.CustomerName.value !== '') {
      CustomerSearchCriteria.CustomerName = this.changeCustomerForm.controls.CustomerName.value;
    }
    if (this.changeCustomerForm.controls.CustomerNumber.value && this.changeCustomerForm.controls.CustomerNumber.value !== '') {
      CustomerSearchCriteria.CustomerNumber = this.changeCustomerForm.controls.CustomerNumber.value;
    }

    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_LIST, parameterObject: CustomerSearchCriteria }).then(
      (response) => {
        this.isSearchByContactDetail = false;
        this.rowData = response;
        this.cdrService.callDetectChanges(this.cdr);
      });
  }

  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {}
   * @desc this method is use to initalize customer from
   * @memberof ChangeCustomerComponent
   */
  initialLoadChangeCustomerForm(): void {
    this.changeCustomerForm = this.fb.group({
      CustomerName: '',
      CustomerNumber: '',
    });
  }

  /**
   * @author Manali Joshi
   * @createdDate 23/12/2019
   * @param {}
   * @desc this method is use to initalize contect from
   * @memberof ChangeCustomerComponent
   */
  initialLoadChangeCustomerContectForm(): void {
    this.changeCustomerContactForm = this.fb.group({
      Email: '',
      Phone: '',
    });
  }

  ngOnInit() {
    this.initialLoadChangeCustomerForm();
    this.initialLoadChangeCustomerContectForm();
  }

  ngOnDestroy() {
    if (this.cdr) {
      this.cdr.detach();
    }
  }

}
