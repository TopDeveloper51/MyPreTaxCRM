import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LocalStorageUtilityService, DialogService, MessageService } from '@app/shared/services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LoaderService } from '@app/shared/loader/loader.service';
import { CustomerProfileSearchService } from '@app/customer/customer-profile-search/customer-profile-search.service';
import { CustomerProfileComponent } from '@app/customer/dialogs/customer-profile/customer-profile.component';
import * as moment from 'moment-timezone';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ConfirmLargedataDialogComponent } from '@app/shared/dialogue/confirm-largedata-dialog/confirm-largedata-dialog.component';

@Component({
  selector: 'app-customer-profile-search',
  templateUrl: './customer-profile-search.component.html',
  styleUrls: ['./customer-profile-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerProfileSearchComponent implements OnInit, OnDestroy {
  public customerProfileForm: FormGroup;
  public lookupObj: any = {};
  public customerProfileData: any;
  public refundStatusLookup: any = [{ id: "Refund Issued", name: "Refund Issued" }, { id: "Refund Request", name: "Refund Request" }, { id: "Refund Denied", name: "Refund Denied" }, { id: "None", name: "None" }];
  public paymentStatusLookup: any = [{ id: "not clear", name: "Not clear" }, { id: "fully paid", name: "Fully paid" }, { id: "partially paid", name: "Partially paid" }, { id: "not paid at all", name: "Not paid at all" }, { id: "not applicable", name: "Not applicable" }];
  public bpCountLookup = [{ 'id': 50, 'name': '50' }, { 'id': 100, 'name': '100' }];
  public ratingList = [{ 'id': 1, 'name': 1 }, { 'id': 2, 'name': 2 }, { 'id': 3, 'name': 3 }, { 'id': 4, 'name': 4 }, { 'id': 5, 'name': 5 }];
  public responsiblePersonLookup: any = [];
  public radioButton: any = [{ 'id': true, 'name': 'Yes' },
  { 'id': false, 'name': 'No' },
  { 'id': 'all', 'name': 'All' },
  ];
  public columnDefs = [
    {
      headerName: "",
      field: "customerDetail",
      cellRenderer: params => {
        return ` <img style="cursor: pointer;padding-left:0px;padding-right:0px;" data-action-type="goToCustomerCart" alt="Go to customer" title="Go to customer(Reseller:` + params.data.resellerName + `) " src="assets/images/Angebot.png">`
      },
      width: 35,
      sortable: false,
      cellClass: 'ag-icons-wrap',
      tooltip: (p: any) => {
        return '';
      }
    },
    {
      headerName: "Customer Number",
      field: "customerNumber",
      headerTooltip: "Customer Number",
      filter: "agTextColumnFilter",
      width: 160,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Customer Name",
      field: "customerName",
      headerTooltip: "Customer Name",
      filter: "agTextColumnFilter",
      width: 250,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Sales Process Status",
      field: "salesProcessStatus",
      headerTooltip: "Sales Process Status",
      filter: "agTextColumnFilter",
      width: 160,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "State",
      field: "state",
      headerTooltip: "State",
      filter: "agTextColumnFilter",
      width: 90,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Package",
      field: "package2019",
      headerTooltip: "Package 2018",
      filter: "agTextColumnFilter",
      width: 120,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Users",
      field: "noOfUsers2019",
      headerTooltip: "Users",
      filter: "agTextColumnFilter",
      width: 100,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Storage",
      field: "storage2019",
      headerTooltip: "Storage",
      filter: "agTextColumnFilter",
      width: 100,
      cellStyle: { cursor: "pointer" },
      cellRenderer: (params) => {
        if (params && params.data && params.data.storage2019) {
          return params.data.storage2019.toFixed(0)
        }
      }
    },
    {
      headerName: "Price",
      field: "price2018",
      headerTooltip: "Price 2018",
      filter: "agTextColumnFilter",
      width: 90,
      cellStyle: { cursor: "pointer" },
      cellRenderer: (params) => {
        if (params && params.data && params.data.price2018) {
          return params.data.price2018.toFixed(2)
        }
      }
    },
    {
      headerName: "Offices",
      field: "noOfOffices",
      headerTooltip: "Number of Offices",
      filter: "agTextColumnFilter",
      width: 100,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Users",
      field: "noOfUsers",
      headerTooltip: "Number of Users",
      filter: "agTextColumnFilter",
      width: 140,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Applied BP",
      field: "appliedBP2019",
      headerTooltip: "Applied BP 2019",
      filter: "agTextColumnFilter",
      width: 140,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "Funded BP",
      field: "fundedBP2019",
      headerTooltip: "Funded BP 2019",
      filter: "agTextColumnFilter",
      width: 100,
      cellStyle: { cursor: "pointer" },
    },
    {
      headerName: "% Funding",
      field: "fundingPercent",
      headerTooltip: "% Funding 2019",
      filter: "agTextColumnFilter",
      width: 130,
      cellStyle: { cursor: "pointer" },
      cellRenderer: (params) => {
        if (params && params.data && params.data.fundingPercent) {
          return params.data.fundingPercent.toFixed(2)
        }
      }
    },
    {
      headerName: "Efiled returns",
      field: "efiledReturns2019",
      headerTooltip: "Efiled returns 2019",
      filter: "agTextColumnFilter",
      width: 100,
      cellStyle: { cursor: "pointer" },
    }
  ];
  public defaultColDef = {
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
  public sideBar = {
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
  private gridApi: any;
  private gridColumnApi: any;
  constructor(private localStorageUtilityService: LocalStorageUtilityService, private fb: FormBuilder, private customerProfileSearchService: CustomerProfileSearchService, private dialogService: DialogService, private messageService: MessageService, private loaderService: LoaderService, private cdr: ChangeDetectorRef) { }

  public checkLocalStorage() {
    if (this.localStorageUtilityService.checkLocalStorageKey('customerProfileSearch')) {
      this.customerProfileForm.patchValue(this.localStorageUtilityService.getFromLocalStorage('customerProfileSearch'));
    } else {
      this.customerProfileForm.controls.refundStatus.setValue('');
      this.customerProfileForm.controls.addOnFee2019.setValue('all');
      this.customerProfileForm.controls.addOnFee2020.setValue('all');
      this.customerProfileForm.controls.isMailSent.setValue('all');
      this.customerProfileForm.controls.inAppPurchase.setValue('all');
      this.customerProfileForm.controls.addOnFeePhase2017Phase1.setValue('all');
      this.customerProfileForm.controls.clearCase.setValue('all');
      this.customerProfileForm.controls.BPCommitment.setValue('all');
      this.customerProfileForm.controls.resellerId.setValue('');
      this.customerProfileForm.controls.salesProcessStatus.setValue(['Annual 2018', 'Annual 2018 New', 'Annual 2018 New Paid Partially', 'Annual 2018 New w/f Pymnt.', 'Annual 2018 Renew', 'Annual 2018 Renew Paid Partially', 'Annual 2018 Renew w/f Pymnt.', "Annual 2018 Renew didn't use us", "Annual 2018 Renew didn't use us Paid Partially", "Annual 2018 Renew didn't use us w/f Pymnt."]);
      this.customerProfileForm.controls.saleType.setValue([1]);
    }
  }

  public reset() {
    this.customerProfileForm.reset();
    this.onDateChange();
    this.customerProfileForm.controls.refundStatus.setValue('');
    this.customerProfileForm.controls.addOnFee2019.setValue('all');
    this.customerProfileForm.controls.addOnFee2020.setValue('all');
    this.customerProfileForm.controls.clearCase.setValue('all');
    this.customerProfileForm.controls.BPCommitment.setValue('all');
    this.customerProfileForm.controls.resellerId.setValue('');
    this.customerProfileForm.get('salesProcessStatus').setValue(['Annual 2018', 'Annual 2018 New', 'Annual 2018 New Paid Partially', 'Annual 2018 New w/f Pymnt.', 'Annual 2018 Renew', 'Annual 2018 Renew Paid Partially', 'Annual 2018 Renew w/f Pymnt.', "Annual 2018 Renew didn't use us", "Annual 2018 Renew didn't use us Paid Partially", "Annual 2018 Renew didn't use us w/f Pymnt."]);
    this.customerProfileForm.get('saleType').setValue([1]);
    const customerProfileSearchData = JSON.parse(JSON.stringify(this.customerProfileForm.value));
    for (const key in customerProfileSearchData) {
      if (!(customerProfileSearchData[key] || (customerProfileSearchData[key] === false && key !== 'testCustomer'))) {
        delete customerProfileSearchData[key];
      }
    }
    this.localStorageUtilityService.addToLocalStorage('customerProfileSearch', customerProfileSearchData);
    this.search();
  }

  public clear() {
    this.customerProfileForm.reset();
    this.onDateChange();
    this.localStorageUtilityService.removeFromLocalStorage('customerProfileSearch');
    // this.search();
    this.customerProfileData = {
      data: [],
      total: 0
    };
    this.customerProfileForm.controls.addOnFee2019.setValue('all');
    this.customerProfileForm.controls.addOnFee2020.setValue('all');
    this.customerProfileForm.controls.clearCase.setValue('all');
    this.customerProfileForm.controls.BPCommitment.setValue('all');
  }
  /**
   * @author om kanada
   * @param {*} params
   *         holds parameter of particular row
   * @description
   *         this function is perform when ag-grid row clicked.
   * @memberof CustomerProfileSearchComponent
   */
  public onRowClicked(params): void {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute("data-action-type");
      if (actionType === "goToCustomerCart") {
        this.customerDetail(params.data);
      } else {
        if (params.rowIndex) {
          params.data['rowIndex'] = params.rowIndex;
        }
        this.openCustomerProfile(params.data); // display toster if activity is alrday open and show in maximized window
      }
    }
  }

  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'state':
        selected = [];
        selected = this.lookupObj.stateLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('state').patchValue(selected);
        break;

      case 'salesProcessStatus':
        selected = [];
        selected = this.lookupObj.salesProcessStatusLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('salesProcessStatus').patchValue(selected);
        break;

      case 'resellerId':
        selected = [];
        selected = this.lookupObj.resellerLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('resellerId').patchValue(selected);
        break;
      case 'refundStatus':
        selected = [];
        selected = this.refundStatusLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('refundStatus').patchValue(selected);
        break;
      case 'paymentStatus':
        selected = [];
        selected = this.paymentStatusLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('paymentStatus').patchValue(selected);
        break;
      case 'package2017':
        selected = [];
        selected = this.lookupObj.packageLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('package2017').patchValue(selected);
        break;
      case 'package2018':
        selected = [];
        selected = this.lookupObj.packageLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('package2018').patchValue(selected);
        break;
      case 'package2019':
        selected = [];
        selected = this.lookupObj.packageLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('package2019').patchValue(selected);
        break;
      case 'statusList':
        selected = [];
        selected = this.lookupObj.statusList.map(
          item => item.id
        );
        this.customerProfileForm.get('statusList').patchValue(selected);
        break;
      case 'responsiblePersonList':
        selected = [];
        selected = this.lookupObj.responsiblePersonList.map(
          item => item.id
        );
        this.customerProfileForm.get('responsiblePersonList').patchValue(selected);
        break;
      case 'BPCountCommited':
        selected = [];
        selected = this.bpCountLookup.map(
          item => item.id
        );
        this.customerProfileForm.get('BPCountCommited').patchValue(selected);
        break;
      case 'rating':
        selected = [];
        selected = this.ratingList.map(
          item => item.id
        );
        this.customerProfileForm.get('rating').patchValue(selected);
        break;
      case 'platform':
        selected = [];
        selected = this.lookupObj.platformList.map(
          item => item.id
        );
        this.customerProfileForm.get('platform').patchValue(selected);
        break;
    }
  }

  /**
   * @author om kanada
   * @createdDate 02/03/2020
   * @param {*}  inputvalue
   * @memberof CustomerProfileSearchComponent 
   */
  filterData(eventTarget) {
    this.lookupObj.responsiblePersonList = this.responsiblePersonLookup;
    this.lookupObj.responsiblePersonList = this.lookupObj.responsiblePersonList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
  }

  dateChange(event, type) {
    if (type === 'from') {
      if (event.value) {
        this.customerProfileForm.controls.feedbackDateFrom.setValue(moment(event.value).utc().format());
      } else {
        this.customerProfileForm.controls.feedbackDateFrom.setValue(undefined);
      }
    } else if (type === 'to') {
      if (event.value) {
        this.customerProfileForm.controls.feedbackDateTo.setValue(moment(event.value).utc().format());
      } else {
        this.customerProfileForm.controls.feedbackDateTo.setValue(undefined);
      }
    }
  }

  initCustomerProfileSearchForm() {
    this.customerProfileForm = this.fb.group({
      customerId: '',
      customerName: '',
      customerNumber: '',
      state: [''],
      testCustomer: false,
      salesProcessStatus: [''],
      resellerId: [''],
      refundStatus: [''],
      paymentStatus: [''],
      priceGuranteeAmountFrom: '',
      priceGuranteeAmountTo: '',
      package2019: [''],
      package2018: [''],
      package2017: [''],
      appliedBPFrom: '',
      appliedBPTo: '',
      efiled2018From: '',
      efiled2018To: '',
      efiled2019From: '',
      efiled2019To: '',
      fundedBPFrom: '',
      fundedBPTo: '',
      fundingPercentageFrom: '',
      fundingPercentageTo: '',
      officesFrom: '',
      usersTo: '',
      usersFrom: '',
      officesTo: '',
      statusList: [''],
      responsiblePersonList: [''],
      isprofileRespMissing: '',
      addOnFee2020: '',
      addOnFee2019: '',
      clearCase: '',
      BPCommitment: '',
      BPCountCommited: [''],
      feedbackDateFrom: '',
      feedbackDateTo: '',
      rating: [''],
      platform: [''],
      feedbackComment: '',
      saleType: [''],
      inAppPurchase: '',
      isMailSent: '',
      addOnFeePhase2017Phase1: ''
    });
    this.checkLocalStorage();
  }

  // to redirect to customer edit
  public customerDetail(dataItem) {
    window.open('/#/customer/edit/' + dataItem.customerId, '_blank');
  }

  /**
   * @author om kanada
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof CustomerProfileSearchComponent
   */

  public onClearAll(clearSelectfor?: string): void {
    if (this.customerProfileForm && clearSelectfor) {
      this.customerProfileForm.get(clearSelectfor).patchValue([]);
    }
  }

  /**
   * @author om kanada
   * @description close drop-down
   * @param {NgSelectComponent} select
   * @memberof CustomerProfileSearchComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }

  getLookup() {
    this.customerProfileSearchService.getLookupForResponsiblePersonList().then((response: any) => {
      if (response) {
        this.lookupObj = response;
        if (response.salesProcessStatusList) {
          this.customerProfileForm.get('salesProcessStatus').setValue(['Annual 2018', 'Annual 2018 New', 'Annual 2018 New Paid Partially', 'Annual 2018 New w/f Pymnt.', 'Annual 2018 Renew', 'Annual 2018 Renew Paid Partially', 'Annual 2018 Renew w/f Pymnt.', "Annual 2018 Renew didn't use us", "Annual 2018 Renew didn't use us Paid Partially", "Annual 2018 Renew didn't use us w/f Pymnt."]);
        }
        if (response.salesTypeList) {
          this.customerProfileForm.get('saleType').setValue([1]);

        }
        if (response.resellerList) {
          this.customerProfileForm.controls.resellerId.setValue('');
        }
        if (response.responsiblePersonList) {
          this.responsiblePersonLookup = response.responsiblePersonList;
        }
        this.cdr.detectChanges();
      }
    }, (error) => {
      console.log(error);
    });
  }

  downloadSetupReport() {
    this.loaderService.show();
    this.customerProfileSearchService.downloadSetupReport().then((response: any) => {
      this.loaderService.hide();
      if (response && response.data) {
        const byteArray = new Uint8Array(response.data);
        const contentType = 'application/vnd.ms-excel';
        const blob = new Blob([byteArray], { type: contentType });
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "SetupReport_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
        // Append anchor to body.
        document.body.appendChild(a)
        a.click();
      } else {
        this.messageService.showMessage('info', 'No Record Found');
      }
    }, (error) => {
      this.loaderService.hide();
      console.log(error);
    });
  }

  public downloadFullExcel(currentYear) {
    this.loaderService.show();
    this.customerProfileSearchService.downloadFullExcel(currentYear).then((result: any) => {
      this.loaderService.hide();
      if (result && result.data) {
        const byteArray = new Uint8Array(result.data);
        const contentType = 'application/vnd.ms-excel';
        const blob = new Blob([byteArray], { type: contentType });
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "RenewalReport_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
        // Append anchor to body.
        document.body.appendChild(a)
        a.click();
      } else {
        this.messageService.showMessage('info', 'No Record Found');
      }
    }, (error) => {
      this.loaderService.hide();
      console.log(error);
    });
  }
  /**
 * @author om kanada
 * @param {*} params
 *          holds parameter of grid
 * @description
 *         function used to ready grid
 * @memberof ActivityOrderComponent
 */
  onGridReady(params): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (window.innerWidth < 1366) {
      params.api.autoSizeColumns();
    } else {
      params.api.sizeColumnsToFit();
    }
  }

  downloadExcel() {
    this.loaderService.show();
    this.customerProfileSearchService.downloadExcel(this.customerProfileForm.value).then((result: any) => {
      this.loaderService.hide();
      if (result && result.data) {
        const byteArray = new Uint8Array(result.data);
        const contentType = 'application/vnd.ms-excel';
        const blob = new Blob([byteArray], { type: contentType });
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "RenewalReport_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
        // Append anchor to body.
        document.body.appendChild(a)
        a.click();
      } else {
        this.messageService.showMessage('info', 'No Record Found');
      }
    }, (error) => {
      this.loaderService.hide();
      console.log(error);
    });



  }
  // check the givent date is in day light saving on EST zone  or not
  isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  onKeyDown(event, from) {
    this.customerProfileForm.controls.from.setValue(moment(event).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(event) ? '-04:00' : '-05:00'));
  }

  public openCustomerProfile(selectedRow) {
    this.dialogService.custom(CustomerProfileComponent, { 'data': { 'docId': selectedRow.customerId, 'availableDocs': this.customerProfileData.data, 'index': selectedRow.rowIndex } }, { keyboard: false, backdrop: 'static', size: 'xl' }).result.then((result: any) => {
    }, (error) => {
      console.log(error);
    });
  }

  public search(flag?): void {
    if (!flag) {
      this.customerProfileSearchService.customerProfileSearch(this.customerProfileForm.value).then((response: any) => {
        if (response && response.counter) {
          this.dialogService.custom(ConfirmLargedataDialogComponent, { searchdata: this.customerProfileForm.value, counter: response.counter, resultLength: response.resultLength }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
            (response) => {
              if (response) {
                for (const key in response) {
                  if (!(response[key] || (response[key] === false && key !== 'testCustomer'))) {
                    delete response[key]
                  }
                }
                this.localStorageUtilityService.addToLocalStorage('customerProfileSearch', response);
                this.customerProfileSearchService.customerProfileSearch(this.customerProfileForm.value).then((responseData: any) => {
                  if (responseData && responseData.length > 0) {
                    this.customerProfileData = {
                      data: responseData,
                      total: responseData ? (responseData.length > 0 ? responseData[0].total : 0) : 0
                    };
                  } else {
                    this.customerProfileData = {
                      data: [],
                      total: 0
                    };
                  }
                  this.cdr.detectChanges();
                }, (error) => {
                  console.log(error);
                });
              }
            });
        } else {
          if (response && response.length > 0) {
            this.customerProfileData = {
              data: response,
              total: response ? (response.length > 0 ? response[0].total : 0) : 0
            };
          } else {
            this.customerProfileData = {
              data: [],
              total: 0
            };
          }
        }
        this.cdr.detectChanges();
      }, (error) => {
        console.log(error);
      });
    } else {
      const customerProfileSearcData = this.localStorageUtilityService.getFromLocalStorage('customerProfileSearch');
      this.customerProfileSearchService.customerProfileSearch(customerProfileSearcData).then((responseData: any) => {
        if (responseData && responseData.length > 0) {
          this.customerProfileData = {
            data: responseData,
            total: responseData ? (responseData.length > 0 ? responseData[0].total : 0) : 0
          };
        } else {
          this.customerProfileData = {
            data: [],
            total: 0
          };
        }
        this.cdr.detectChanges();
      }, (error) => {
        console.log(error);
      });
    }
  }

  onDateChange(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnInit(): void {
    this.initCustomerProfileSearchForm();
    this.getLookup();
    if (this.localStorageUtilityService.checkLocalStorageKey('customerProfileSearch') && (this.localStorageUtilityService.getFromLocalStorage('customerProfileSearch').returnFullResult === true || this.localStorageUtilityService.getFromLocalStorage('customerProfileSearch').returnFullResult === false)) {
      this.search(true);
    } else {
      this.search();
    }
  }
  ngOnDestroy(): void {
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }

}
