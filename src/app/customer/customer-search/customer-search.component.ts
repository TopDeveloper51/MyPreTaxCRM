// External imports
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { Router } from '@angular/router';

// Internal imports
import { CopyToClipboardService, LocalStorageUtilityService, CDRService, MessageService, UserService, SystemConfigurationService,DialogService} from "@app/shared/services";
import { CustomerSearchService } from "@app/customer/customer-search/customer-search.service";
import { ColDef } from "ag-grid-community";
import { CustomerCardEditableComponent } from '@app/customer/components/customer-card-editable/customer-card-editable.component';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';

@Component({
  selector: "app-customer-search",
  templateUrl: "./customer-search.component.html",
  styleUrls: ["./customer-search.component.scss"],
  // providers: [CustomerSearchService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSearchComponent implements OnInit {

  public rowData: any = [];
  public defaultColDef: any;
  public sideBar: any;
  public gridApi;
  public gridColumnApi;
  public columnDefs: ColDef[];
  public getRowHeight;

  public availableCustomer: { data: any; total: any };
  public customerSearch: any = {};
  public customerSearchForm: any = {}
  public isEFINSearch: boolean = false; // for searching using topEfin
  public isSearchDone: boolean = false;
  public isFilterApplied: boolean = false;
  public isSearchCalled: boolean = false
  isDefaultReseller: boolean = this.userService.isDefaultReseller();
  isClearSearch: boolean = false;

  @ViewChild('customersearch', { static: false }) customersearch: CustomerCardEditableComponent;


  constructor(private cdr: ChangeDetectorRef, private router: Router, private systemConfigurationService: SystemConfigurationService,
    private clipboard: CopyToClipboardService, private localStorageUtilityService: LocalStorageUtilityService, private messageService: MessageService,
    private customerSearchService: CustomerSearchService, private cdrService: CDRService, private userService: UserService,private dialogService: DialogService) {
    this.columnDefs = [
      {
        headerName: "Customer Number",
        field: "customerNumber",
        width: 150,
        headerTooltip: "Customer Number",
        sortable: true,
        filter: "agTextColumnFilter"
      },
      {
        headerName: "Customer Name",
        field: "customerName",
        tooltipField: "customerName",
        width: 370,
        headerTooltip: "Customer Name",
        sortable: true,
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        comparator: (valueA, valueB) => {
          return this.systemConfigurationService.agGridCaseInSensitiveSort(valueA, valueB);
        }
      },
      {
        headerName: "State",
        field: "state",
        width: 120,
        headerTooltip: "State",
        sortable: true,
        filter: "agTextColumnFilter"
      },
      {
        headerName: "City",
        field: "city",
        width: 150,
        headerTooltip: "City",
        sortable: true,
        filter: "agTextColumnFilter"
      },
      {
        headerName: "ZIP",
        field: "zipCode",
        width: 100,
        headerTooltip: "ZIP",
        sortable: true,
        type: 'numericColumn',
        filter: "agTextColumnFilter"
      },
      {
        headerName: "Sales Process Status",
        field: "salesProcessStatus",
        headerTooltip: "Sales Process Status",
        sortable: true,
        width: 310,
        filter: "agTextColumnFilter"
      },
      {
        headerName: "BPVolume",
        field: "BPVolume",
        width: 150,
        headerTooltip: "BPVolume",
        sortable: true,
        cellRenderer: params => {
          if (params.value !== "Unknown") {
            return params.value;
          } else if (params.value == "Unknown") {
            return "Unknown";
          }
        },
        filter: "agTextColumnFilter",
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: "Bank",
        field: "bank",
        width: 150,
        autoHeight: true,
        headerTooltip: "Bank",
        sortable: true,
        tooltipField: "bank",
        cellRenderer: params => {
          let element = `<div>`;
          if (params.value) {
            for (let bankName of params.value) {
              element += `${bankName}<br>`;
            }
          }
          element += "</div>";
          return element;
        },
        cellStyle: { cursor: "pointer" },
        filter: "agTextColumnFilter",
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: "Actions",
        field: "customerID",
        width: 90,
        headerTooltip: "Actions",
        cellStyle: { textAlign: 'right' },
        sortable: false,
        cellRenderer: params => {
          // let element = `<a class="cursor-pointer" data-action-type="edit" href='https://customercenter2.dynamic1001.eu/MyTaxPrepAPI/TaxCJ.html?custId=${params.value}'>
          //                 <img style="cursor: pointer;" height="17px" width="13px" alt="Customer Journey " title="Customer Journey " src="../../../assets/images/icon_Detail.png">
          //                 </a>
          //                 <img style="cursor: pointer;" data-action-type="toClipboard" height="18px" width="18px" alt="Copy customer id to clipboard" title="Copy customer id to clipboard" src="../../../assets/images/copyToClipboard.png">
          //                 `;
          let element = `<a class="cursor-pointer text-decoration-none" data-action-type="edit" href='https://customercenter2.dynamic1001.eu/MyTaxPrepAPI/TaxCJ.html?custId=${params.value}' style="
          color: inherit !important;">
            <i class="far fa-file-alt cursor-pointer font-15" title="Customer Journey"></i>                          
          </a>
          <i class="far fa-clipboard cursor-pointer font-15 ml-2" data-action-type="toClipboard" title="Copy customer id to clipboard"></i>`;
          return element;
        },
        tooltip: () => {
          return '';
        }
      }
    ],
      this.defaultColDef = {
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        resizable: true,
        tooltip: (p: any) => {
          return p.value;
        },
        // suppressMenu: true,
        suppressMaxRenderedRowRestriction: true,
        suppressColumnVirtualisation: true
      };
    this.sideBar = {
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel"
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel"
        }
      ]
    };
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 14/10/2019
   * @param {*} params
   * @memberof CustomerSearchComponent
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    }
    else {
      params.api.sizeColumnsToFit();
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 14/10/2019
   * @description copy customerID
   * @param {*} e
   * @memberof CustomerSearchComponent
   */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "toClipboard":
          this.clipboard.copy(e.data.customerID);
          break;
        default:
          window.open('/#/customer/edit/' + e.data.customerID, '_blank');
          break;
      }
    }
  }


  setAvailableCustomer(event) {
    this.availableCustomer = event;
    this.rowData = event.data;
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description search with EFIN val
   * @memberof CustomerSearchComponent
   */
  public searchEFIN(): void {
    this.isEFINSearch = true;
    this._initAvailableCustomer();
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 14/10/2019
   * @description get lookup values
   * @memberof CustomerSearchComponent
   */
  public getLookupForCustomer(): void {
    const self = this;
    self.customerSearchService.getLookupForCustomer().then(
      (response: any) => {
        self.customerSearch = response;
        self.customerSearch.refundRequestFeelingList = response.refundRequestFeeling;
        self.cdr.detectChanges();
      },
      error => {
        console.error(error);
      }
    );
  }

  /**
* @author Dhruvi Shah
* @createdDate 15/10/2019
* @description Reset filters
* @updatedBy Manali Joshi
* @updatedDate 19-12-2019
* @memberof CustomerSearchComponent
*/
  public clearSearch() {
    // this.isClearSearch = true;
    this.isEFINSearch = false;
    this.customerSearch.TopEFIN = "";
    this.availableCustomer = undefined;
    this.isSearchDone = false;
    // remove customerSearch object from local storage
    this.localStorageUtilityService.removeFromLocalStorage('customerSearchObject');
    this.showDefaultResellerId();
    this.customersearch.clear();
    this.cdrService.callDetectChanges(this.cdr);
  }

  private showDefaultResellerId(): void {
    // if default reseller is not availble
    if (!this.isDefaultReseller) {
      this.customerSearch.resellerIdResult = [this.userService.getResellerId()];
      if (this.customerSearch.resellerIdResult !== undefined && this.customerSearch.resellerIdResult != null && this.customerSearch.resellerIdResult !== '') {
        for (const obj of this.customerSearch.resellerList) {
          if (obj.id === this.customerSearch.resellerIdResult[0]) {
            this.customerSearch.reselllerName = obj.name;
          }
        }
      }
    }
    this.cdrService.callDetectChanges(this.cdr);
  };

  public newCustomer(): void {
    this.router.navigate(['customer', 'new']);
  }

  getFormValue() {
    this.isSearchCalled = !this.isSearchCalled;
    this.cdrService.callDetectChanges(this.cdr)
  }

  changeCustomerSearchFormValue(event) {
    this.customerSearchForm = event;
    if (!this.isClearSearch) {
      this.search();
    }
    else {
      this.isClearSearch = !this.isClearSearch;
    }
  }
  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description validate BPVolume and sinceHowManyYear and show toater
   * @memberof CustomerSearchComponent
   */
  public search(): void {
    this.customerSearch.BPVolumeFrom = !isNaN(parseInt(this.customerSearchForm.BPVolumeFrom)) ? parseInt(this.customerSearchForm.BPVolumeFrom) : undefined;
    this.customerSearch.BPVolumeTo = !isNaN(parseInt(this.customerSearchForm.BPVolumeTo)) ? parseInt(this.customerSearchForm.BPVolumeTo) : undefined;
    this.customerSearch.sinceHowManyYearsWithUsFrom = !isNaN(parseInt(this.customerSearchForm.sinceHowManyYearsWithUsFrom)) ? parseInt(this.customerSearchForm.sinceHowManyYearsWithUsFrom) : undefined;
    this.customerSearch.sinceHowManyYearsWithUsTo = !isNaN(parseInt(this.customerSearchForm.sinceHowManyYearsWithUsTo)) ? parseInt(this.customerSearchForm.sinceHowManyYearsWithUsTo) : undefined;
    this.customerSearch.transmitterFeeFrom = !isNaN(parseInt(this.customerSearchForm.transmitterFeeFrom, 0)) ? parseInt(this.customerSearchForm.transmitterFeeFrom) : undefined;
    this.customerSearch.transmitterFeeTo = !isNaN(parseInt(this.customerSearchForm.transmitterFeeTo, 0)) ? parseInt(this.customerSearchForm.transmitterFeeTo, 0) : undefined;
    this.customerSearch.addOnTransmitterSharePerFrom = !isNaN(parseInt(this.customerSearchForm.addOnTransmitterSharePerFrom, 0)) ? parseInt(this.customerSearchForm.addOnTransmitterSharePerFrom, 0) : undefined;
    this.customerSearch.addOnTransmitterSharePerTo = !isNaN(parseInt(this.customerSearchForm.addOnTransmitterSharePerTo, 0)) ? parseInt(this.customerSearchForm.addOnTransmitterSharePerTo, 0) : undefined;
    this.customerSearch.addOnPPSharePerFrom = !isNaN(parseInt(this.customerSearchForm.addOnPPSharePerFrom, 0)) ? parseInt(this.customerSearchForm.addOnPPSharePerFrom, 0) : undefined;
    this.customerSearch.addOnPPSharePerTo = !isNaN(parseInt(this.customerSearchForm.addOnPPSharePerTo, 0)) ? parseInt(this.customerSearchForm.addOnPPSharePerTo, 0) : undefined;

    if (this.customerSearch.transmitterFeeFrom > this.customerSearch.transmitterFeeTo) {
      this.messageService.showMessage("'Transmitter Fee To' should be greater than 'Transmitter Fee From'", 'error');
    } else if (this.customerSearch.addOnTransmitterSharePerFrom > this.customerSearch.addOnTransmitterSharePerTo) {
      this.messageService.showMessage("'Add On Transmitter Fee Share To' should be greater than 'Add On Transmitter Fee Share From'", 'error');
    } else if (this.customerSearch.addOnPPSharePerFrom > this.customerSearch.addOnPPSharePerTo) {
      this.messageService.showMessage("'Add On Protection Plus Fee Share To' should be greater than 'Add On Protection Plus Fee Share From'", 'error');
    } else if (this.customerSearch.BPVolumeFrom > this.customerSearch.BPVolumeTo) {
      this.messageService.showMessage(
        "'BP Volume To' should be greater than 'BP Volume From'",
        "error"
      );
    } else if (
      this.customerSearch.sinceHowManyYearsWithUsFrom >
      this.customerSearch.sinceHowManyYearsWithUsTo
    ) {
      this.messageService.showMessage(
        "'Years with us <=' should be greater than 'Years with us >='",
        "error"
      );
    } else {
      this.isEFINSearch = false;
      this._initAvailableCustomer();
    }
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @description search customer based on filter
   * @updatedBy Manali Joshi
   * @updatedDate 19-12-2019
   * @memberof CustomerSearchComponent
   */
  public _initAvailableCustomer() {
    const self = this;

    self.isFilterApplied = false;
    for (let obj in self.customerSearchForm) {
      if (self.customerSearchForm[obj]) {
        self.isFilterApplied = true;
      }
    }

    let responsiblePesron: any = [];
    let groupName = [];
    if (
      self.customerSearchForm.responsible !== "" &&
      self.customerSearchForm.responsible !== null
    ) {
      self.customerSearch.responsiblePesronList.map(item => {
        if (groupName.indexOf(item.group) == -1) {
          groupName.push(item.group);
        }
      });
      self.customerSearchForm.responsible = responsiblePesron;
    }

    // store customer search object in localStorage
    this.localStorageUtilityService.addToLocalStorage('customerSearchObject', this.customerSearchForm);

    self.customerSearchService
      .searchData(this.customerSearchForm, this.isEFINSearch, this.customerSearch.TopEFIN)
      .then(
        (response: any) => {
          if (response.data && response.data.counter) {
            this.dialogService.custom(ConfirmLargedataDialogComponent, {searchdata:this.customerSearchForm,isEFINSearch:this.isEFINSearch,TopEFIN:this.customerSearch.TopEFIN,screen:"customersearch" ,counter: response.data.counter, resultLength: response.data.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
              (response) => {

                if (response) {
                  this.customerSearchService.searchData(response,response.isEFINSearch,response.TopEFIN).then((result: any) => {
                    if (this.customerSearchForm.resellerId !== undefined && this.customerSearchForm.resellerId !== null && this.customerSearchForm.resellerId !== '') {
                      this.customerSearchForm.resellerName = [];
                      for (let reseller of this.customerSearchForm.resellerId) {
                        let obj = this.customerSearch.resellerList.find(o => reseller === o.id);
                        if (obj !== undefined && obj !== null) {
                          this.customerSearchForm.resellerName.push(obj.name);
                        }
                      }
                    }
                    this.isSearchDone = true;
                    result.data.forEach(element => {
                      if (element.FOIAReturn) {
                        element.acReturnTitle = "FOIA 2015 Accepted Return Count";
                      }
                    });
                    self.availableCustomer = result;
                    self.rowData = self.availableCustomer.data;
                    self.cdrService.callDetectChanges(self.cdr);

                  });
                }
              }, (error) => {
                console.error(error);
              }
            );
          } else {
            if (this.customerSearchForm.resellerId !== undefined && this.customerSearchForm.resellerId !== null && this.customerSearchForm.resellerId !== '') {
              this.customerSearchForm.resellerName = [];
              for (let reseller of this.customerSearchForm.resellerId) {
                let obj = this.customerSearch.resellerList.find(o => reseller === o.id);
                if (obj !== undefined && obj !== null) {
                  this.customerSearchForm.resellerName.push(obj.name);
                }
              }
            }

            this.isSearchDone = true;
            if (response && response.data) {

              response.data.forEach(element => {
                if (element.FOIAReturn) {
                  element.acReturnTitle = "FOIA 2015 Accepted Return Count";
                }
              });
              self.availableCustomer = response;
              self.rowData = self.availableCustomer.data;
              self.cdrService.callDetectChanges(self.cdr);
            }
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 14/10/2019
   * @memberof CustomerSearchComponent
   * @updatedBy Manali Joshi
   * @updatedDate 19-12-2019
   */
  ngOnInit() {
    this.getLookupForCustomer();
    // if localstorage allready contains serach value then assign to search form and load data accordingly
    if (this.localStorageUtilityService.checkLocalStorageKey('customerSearchObject')) {
      this.customerSearchForm = this.localStorageUtilityService.getFromLocalStorage('customerSearchObject');
    }
  }
}
