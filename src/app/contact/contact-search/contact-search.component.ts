// External imports
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogService } from '@app/shared/services/dialog.service';
// Internal imports
import {
  CDRService,
  CommonApiService, LocalStorageUtilityService
} from '@app/shared/services';
import { ContactSearchService } from '@app/contact/contact-search/contact-search.service';
import { ContactDetailComponent } from '@app/contact/dialogs/contact-detail/contact-detail.component';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';


@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.scss'],
  providers: [ContactSearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSearchComponent implements OnInit, OnDestroy {
  public contactSearchForm: FormGroup;
  public contactSearch: any = { emailStatus: [], emailStatusResult: [] }; // To store contact serach data
  // for store emailStatusList
  public emailStatusList: any;
  public availableContact: { data: any; total: any };
  public rowData: any = [];
  public defaultColDef: any;
  public rowDragManaged: any;
  private gridApi;
  private gridColumnApi;
  public columnDefs: any;
  public sideBar: any;
  public multiSortKey: string;
  public animateRows: string;
  public floatingFilter: string;
  public enableCharts: string;
  public enableRangeSelection: string;
  public rowModelType;
  public cacheBlockSize;
  public maxBlocksInCache;
  public rowSelection: string;
  public getRowHeight: any;
  private preserveLocalStorageData: any = {};

  constructor(
    private contactSearchService: ContactSearchService,
    private commonApiService: CommonApiService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private cdrService: CDRService,
    private cdr: ChangeDetectorRef,
    private localStorageUtilityService: LocalStorageUtilityService
  ) {
    this.columnDefs = [
      {
        headerName: 'Customer Number',
        field: 'customerNumber',
        width: 150,
        headerTooltip: 'Customer Number',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Company Name',
        field: 'customerName',
        width: 150,
        headerTooltip: 'Company Name',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        width: 150,
        headerTooltip: 'First Name',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        width: 150,
        headerTooltip: 'Last Name',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Telephone',
        field: 'phone',
        width: 150,
        headerTooltip: 'Telephone',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Email',
        field: 'email',
        headerTooltip: 'Email',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Email Status',
        field: 'emailStatusValue',
        width: 150,
        headerTooltip: 'Email Status',
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Wrong No.',
        field: 'isWrongNumber',
        width: 100,
        headerTooltip: 'Wrong No.',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.isWrongNumber) {
              return '<span><i class="fas fa-check"></i></span>';
            }
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Invalid No.',
        field: 'isInvalidNumber',
        width: 100,
        headerTooltip: 'Invalid No.',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.isInvalidNumber) {
              return '<span><i class="fas fa-check"></i></span>';
            }
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Unsubscribed?',
        field: 'unsubscribeEmail',
        width: 100,
        headerTooltip: 'Unsubscribed?',
        // rowDrag: true,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          if (params.data) {
            if (params.data.unsubscribeEmail) {
              return '<span><i class="fas fa-check"></i></span>';
            }
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Unsubscribe Reason',
        field: 'unsubscribeReason',
        width: 200,
        headerTooltip: 'Unsubscribe Reason',
        tooltipField: 'unsubscribeReason',
        cellStyle: { "cursor": 'pointer' },
        // rowDrag: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: '',
        field: 'isMultipleContact',
        width: 60,
        headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return '<a  target="_blank"><i class="far fa-clone font-15  cursor-pointer" title="This Contact Card contains multiple contacts"></i></a>';
          // <img style="cursor: pointer;" height="16" width="16" alt="This Contact Card contains multiple contacts" title="This Contact Card contains multiple contacts" src="assets/images/multiple-contacts.png">
        },
        cellClass: 'text-center',
        suppressMenu: true,
        suppressMovable: true,
        sortable: false,
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Actions',
        minwidth: 60,
        width: 60,
        headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return '<a  target="_blank"> <img style="cursor: pointer;" height="16" width="16" alt="Open Customer" title="Open Customer" data-action-type="goToCustomerCart" src="assets/images/Angebot.png"></a>';
        },
        cellClass: 'text-center',
        suppressMenu: true,
        suppressMovable: true,
        sortable: false,
        tooltip: () => {
          return '';
        }
      }
    ];

    this.sideBar = {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel"
        },
      ]
    };
    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      tooltip: (p: any) => {
        return p.value;
      },
      resizable: true,
      suppressMaxRenderedRowRestriction: true,
      suppressColumnVirtualisation: true
    };
    this.multiSortKey = 'ctrl';
    this.rowDragManaged = 'true';
    this.animateRows = 'true';
    this.floatingFilter = 'true';
  }
  // openCustomDialog() {
  //   this.dialogService.custom(ContactDetailComponent, {}, {}).result.then(response => {

  //   });
  // }
  // openConfirmDialog() {
  //   const dialogConfig = { 'keyboard': false, 'backdrop': 'static', 'size': 'md' };
  //   const dialogData = { title: "Confirmation", text: "<span class='text-danger'>This user is already verified. You have made changes in the data which is used in the verification process. When you save the changes, you need to do the verification process again. Are you sure you want to continue?</span>" }
  //   this.dialogService.confirm(dialogData, dialogConfig);
  // }
  // openNotifyDialog() {
  //   const dialogData = { title: "Confirmation", text: "<span class='text-danger'>This user is already verified. You have made changes in the data which is used in the verification process. When you save the changes, you need to do the verification process again. Are you sure you want to continue?</span>" }
  //   this.dialogService.notify(dialogData, {});
  // }

  /**
   * @author om kanada
   * This function is used to intialize contact form.
   * @memberof ContactSearchComponent
   */
  public initContactSearchForm(): void {
    this.contactSearchForm = this.formBuilder.group({
      contactName: [''],
      email: [''],
      telephone: [''],
      emailStatus: [''],
      unsubscribeEmail: [null],
      testCustomer: [null],
      isWrongNumber: [null],
      isInvalidNumber: [null],
    });
    this.cdrService.callDetectChanges(this.cdr);
  }

  public onRowClicked(e: any) {
    // if (e.event.target) {
    //   this.newCustomer(e.data);
    //  this.openContactCard();
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "goToCustomerCart":
          this.goToCustomerCart(e.data.customerId);
          break;
        default:
          this.newCustomer(e.data);
          break;
      }
    }
    //   }
  }

  private goToCustomerCart(customerId) {
    window.open('/#/customer/edit/' + customerId, '_blank');
  }

  public newCustomer(contactRowData?) {
    this.dialogService.custom(ContactDetailComponent, { contactRowData: contactRowData, nextPrev: this.rowData }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((response) => {
      if (response) {
        this.Search(true);
      }
    }, (error) => {
      console.error(error);
    });
  }
  /**
   * @author om kanada
   * this function is used to clear input data.
   * @memberof ContactSearchComponent
   * @updatedBy Manali Joshi
   * @updatedDate 19-12-2019
   */
  clearInputData(): void {
    this.contactSearchForm.reset();
    this.availableContact = undefined;
    // remove activity Search object from local storage to reset search filters
    this.localStorageUtilityService.removeFromLocalStorage('contectSearchObject');
  }

  // openContactCard(): void {
  //   const selectedRows = this.gridApi.getSelectedRows();
  //   console.log(selectedRows);
  //   this.dialogService.custom(ContactDetailComponent, {}, { keyboard: false, backdrop: true, size: 'xl' }).result.then(response => {
  //     if (response) {
  //       this.Search();
  //     }
  //   }, (error) => {
  //     console.log(error);
  //   });
  //   this.dialogService.custom(ContactHistoryComponent, {}, { keyboard: false, backdrop: true, size: 'lg' }).result.then(response => {

  //   });
  //   this.dialogService.custom(VerifyNumberComponent, {}, { keyboard: false, backdrop: true, size: 'sm' }).result.then(response => {

  //     });
  //   this.dialogService.custom(EmailChangeComponent, {}, { keyboard: false, backdrop: true, size: 'lg' }).result.then(response => {

  //   });
  // }

  /**
   * @author om kanada
   * search available contact data.
   * @updatedBy Manali Joshi
   * @updatedDate 19-12-2019
   * @memberof ContactSearchComponent
   */
  Search(isFromOnInit?): void {
    const self = this;
    // set serach criteria  to local storage for preserve its state for future
    const contactSearchData = JSON.parse(JSON.stringify(self.contactSearchForm.value));
    if (this.preserveLocalStorageData && Object.keys(this.preserveLocalStorageData).length > 0) {
      if (this.preserveLocalStorageData.returnFullResult) {
        contactSearchData['returnFullResult'] = this.preserveLocalStorageData.returnFullResult;
      } else {
        contactSearchData['returnFullResult'] = this.preserveLocalStorageData.returnFullResult;
      }
    }
    this.localStorageUtilityService.addToLocalStorage('contectSearchObject', contactSearchData);
    if (!isFromOnInit) {
      if (this.contactSearchForm.value && this.contactSearchForm.value['returnFullResult']) {
        delete this.contactSearchForm.value['returnFullResult'];
      }
      self.contactSearchService.searchData(self.contactSearch, self.contactSearchForm.value).then(
        (Response: any) => {
          self.availableContact = Response;
          if (Response.data && Response.data.counter) {
            this.dialogService.custom(ConfirmLargedataDialogComponent, { searchdata: self.contactSearchForm.value, counter: Response.data.counter, resultLength: Response.data.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
              (response) => {

                if (response) {
                  this.localStorageUtilityService.addToLocalStorage('contectSearchObject', response);
                  this.contactSearchService.searchData(response, self.contactSearch).then((result: any) => {
                    self.availableContact = result;
                    this.rowData = result.data;
                    self.cdrService.callDetectChanges(self.cdr);

                  });
                }
              }, (error) => {
                console.error(error);
              }
            );
          } else {
            if (Response && Response.data) {
              self.rowData = Response.data;
              self.cdrService.callDetectChanges(self.cdr);
            }
          }
        },
        error => {
          console.log(error);
        }
      );
    } else {
      this.contactSearchService.searchData(contactSearchData, self.contactSearch).then((result: any) => {
        self.availableContact = result;
        this.rowData = result.data;
        self.cdrService.callDetectChanges(self.cdr);

      });
    }

  }

  /**
   * @author om kanada
   * Fetch Email status lookup.
   * @memberof ContactSearchComponent
   */
  protected getEmailStatusLookup(): void {
    const self = this;
    self.contactSearchService.getEmailStatusLookup().then(
      (response: any) => {
        self.contactSearch.emailStatusList = response;
        self.emailStatusList = JSON.parse(JSON.stringify(response));
        self.cdrService.callDetectChanges(self.cdr);
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
   * @author om kanada
   * grid Ready.
   * @memberof ContactSearchComponent
   */
  onGridReady(params) {

    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    }
    else {
      params.api.sizeColumnsToFit();
    }


    // If you need to resize specific columns 
    // var allColIds = params.columnApi.getAllColumns().map(column => column.email);
    // params.columnApi.autoSizeColumns(allColIds);

    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // const server = this.GetServer();
    // const datasource = this.ServerSideDatasource();
    // params.api.setServerSideDatasource(datasource);
  }

  /**
   * @author om kanada
   * ngDestroy.
   * @memberof ContactSearchComponent
   */
  ngOnDestroy() {
    if (this.cdr) {
      this.cdr.detach();
    }
  }

  ServerSideDatasource(): any {
    const self = this;
    return {
      getRows(params) {
        console.log(params.request);
        self.contactSearchService.searchData(self.contactSearch, self.contactSearchForm.value).then(
          (response: any) => {
            self.availableContact = response;
            if (response && response.data) {
              params.successCallback(response.data, 1000);
            } else {
              params.failCallback();
            }
          },
          error => {
            console.log(error);
          }
        );
      }
    };
  }

  /**
   * @author om kanada
   * this function is select all Dropdown Data.
   * @memberof ContactSearchComponent
   */
  public onSelectAll() {
    const selected = this.contactSearch.emailStatusList.map(item => item.id);
    this.contactSearchForm.get('emailStatus').patchValue(selected);
  }


  closeSelect(select: NgSelectComponent) {
    select.close();
  }

  /**
   * @author om kanada
   * this function is Unselect all Dropdown Data.
   * @memberof ContactSearchComponent
   */
  public onClearAll() {
    this.contactSearchForm.get('emailStatus').patchValue([]);
  }
  ngOnInit() {
    this.initContactSearchForm();
    this.getEmailStatusLookup();
    // if localstorage allready contains serach value then assign to search form and load data accordingly
    if (this.localStorageUtilityService.checkLocalStorageKey('contectSearchObject')) {
      this.preserveLocalStorageData = this.localStorageUtilityService.getFromLocalStorage('contectSearchObject');
      this.contactSearchForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('contectSearchObject'));
    }
  }
}
