import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

//Internal imports
import { TicketActivityOverlayService } from '@app/ticket-activity/ticket-activity-overlay.service';
import { MessageService, CommonApiService, CDRService, DialogService, CommonDataApiService, UserService } from "@app/shared/services";
import { BankproductHistoryComponent } from '@app/customer/dialogs/bankproduct-history/bankproduct-history.component';
import { APINAME } from "@app/customer/customer-constants";
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';
import { PostalChannelService } from '@app/shared/services/postChannel.service';
import { ActivitySearchDetailsService } from '@app/activity/activity-search/activity-search-details.service';

@Component({
  selector: 'app-customer-bankproduct-header-detail',
  templateUrl: 'customer-bankproduct-header-detail.component.html',
  styleUrls: ['./customer-bankproduct-header-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})

export class CustomerBankproductHeaderDetailComponent implements OnInit {

  @Input() customerID: any;
  @Input() unidentifiedCustomer: any;
  @ViewChild('windowTitleBar', { static: false }) windowTitleBar: any;

  //
  public defaultColDef: any;
  public customerBPHistoryDetailsColumnDefs: any;
  public customerBPHistoryDetailsRowData: any;
  public customerBPHistoryDetailsGridApi: any;
  public sources: any = [];
  public domLayout;

  public filterResponsiblePerson: any = [];
  public responsiblePersonArray = [];
  public resetResposiblePersonList = [];

  //
  public bpHistoryDetails: any = [];
  public bpHeader: any;


  // Title Header Data Relataed
  public userResellerId = '';
  public showBlacklistIcon: Boolean = false;
  public isDoNotCall: boolean = false;
  public opendedActivities = [];
  public isEmailIn: boolean = false;  // to set flag true when screen is email and direction is in


  constructor(
    private commonApiService: CommonApiService,
    private messageService: MessageService,
    private CDRService: CDRService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private dialogService: DialogService,
    private ticketActivityOverlayService: TicketActivityOverlayService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
    private commonDataApiService: CommonDataApiService,
    private postalChannelService: PostalChannelService,
    private activitySearchDetailsService: ActivitySearchDetailsService,
    private userService: UserService,
  ) {

    const self = this;
    this.customerBPHistoryDetailsColumnDefs = [
      {
        headerName: '',
        field: 'isSelected',
        width: 30,
        cellStyle: { 'cursor': 'pointer' },
        cellRenderer: params => {
          var input = document.createElement('input');
          input.type = "radio";
          input.checked = params.value;
          input.name = "radioButton";
          input.addEventListener('change', function (event) {
            params.value = !params.value;
            params.node.data.fieldName = params.value;
            self.setHeader(params.node.data)
          });
          return input;
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: '',
        field: 'isHeader',
        width: 40,
        cellStyle: { 'cursor': 'pointer' },
        cellRenderer: params => {
          if (params.data.actId != undefined && params.data.actId != '') {
            return ` <img data-action-type="openActivity" src="assets/images/activity_icon.png" title="Open Activity">`
          }
        },
        tooltip: () => {
          return '';
        }
      },
      {
        headerName: 'Year',
        field: 'year',
        width: 70,
        headerTooltip: 'Year',
        tooltipField: 'year'
      },
      {
        headerName: 'Bank',
        field: 'bank',
        width: 170,
        headerTooltip: 'Bank',
        tooltipField: 'bank'

      },
      {
        headerName: 'Volume',
        field: 'volume',
        width: 100,
        headerTooltip: 'Volume',
        type: 'numericColumn',
        cellRenderer: params => {
          if (params.data.isUnknownVolume) {
            return 'Unknown';
          } else {
            return params.data.volume;
          }

        },
      },
      {
        headerName: 'Source',
        field: 'source',
        width: 130,
        headerTooltip: 'Source',
        tooltipField: 'source'

      },
      {
        headerName: 'Date',
        field: 'date',
        width: 90,
        headerTooltip: 'Date',
        cellRenderer: params => {
          return self.datePipe.transform(params.value, 'MM/dd/yy');
        }
      },
      {
        headerName: 'Created By',
        field: 'createdByName',
        width: 120,
        headerTooltip: 'Created By',
        tooltipField: 'createdByName'

      },
      {
        headerName: 'C. Date',
        field: 'createdDate',
        width: 100,
        headerTooltip: 'Created Date',
        cellRenderer: params => {
          return self.datePipe.transform(params.value, 'MM/dd/yy');
        }
      },
      {
        headerName: 'Updated By',
        field: 'updatedByName',
        width: 100,
        headerTooltip: 'Updated By',
        tooltipField: 'updatedByName'
      },
      {
        headerName: 'U. Date',
        field: 'updatedDate',
        width: 90,
        headerTooltip: 'Updated Date',
        cellRenderer: params => {
          return self.datePipe.transform(params.value, 'MM/dd/yy');
        }
      },
      {
        headerName: 'Header?',
        field: 'isHeader',
        width: 80,
        headerTooltip: 'IsHeader',
        cellRenderer: params => {
          if (params.value) {
            return ` <img height="15px" width="15px" style="margin-left : 15px" src="assets/images/Approved.png">`
          }
        },
        tooltip: () => {
          return '';
        }
      },
    ];
    this.defaultColDef = {
      enableValue: true,
      sortable: false,
      resizable: false,
      tooltip: (p: any) => {
        return p.value;
      },
      lockPosition: true,
      enableBrowserTooltips: true
    };
    this.domLayout = "autoHeight";
  }

  onGridReady(params) {
    this.customerBPHistoryDetailsGridApi = params.api;
    params.api.sizeColumnsToFit();
  }

	/**
	 * @author Dhruvi Shah
	 * @createdDate 20-12-2019
	 * @param {*} e
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      const actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "openActivity":
          setTimeout(() => {
            this.checkActivityAlreadyOpenOrNot(e);
          }, 0);
          break;
      }
    }
  }

  /**
* @author Manali Joshi
* @createdDate 17-01-2019
* @description this function is used to check activity is open already in current tab
* @param {*} id
* @memberof ActivityOrderComponent
*/
  checkActivityAlreadyOpenOrNot(e) {
    let dialogData = { id: e.data.actId, screen: 'activity', flag: true };
    this.ticketActivityOverlayService.openWindow(dialogData, undefined, this.windowTitleBar);
    if (!dialogData) {
      this.opendedActivities.push(e.data.id);
    }
  }

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description set header details
	 * @param {*} data
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  setHeader(data) {
    let self = this;
    if (!data.isHeader) {
      let saveObject = JSON.parse(JSON.stringify(data));
      // Open dialog for conformation before Change
      const dialogData = { title: 'Confirmation', text: `Are you sure you want to set this record as Bank Product Header?` };
      self.dialogService.confirm(dialogData, {}).result.then(
        (result) => {
          if (result === 'YES') {
            self.saveNewBPHistory(saveObject);
          }
        }, (error) => {
          self.getBPHistoryDetails();
        }
      );
    }
  }


	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description save BPHistory and change its header details
	 * @param {*} saveObject
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  public saveNewBPHistory(saveObject) {
    if (saveObject.isHeader == undefined) {
      saveObject.isHeader = false;
    }
    saveObject.customerId = this.customerID;
    for (const obj of this.sources) {
      if (saveObject.source == obj.name) {
        saveObject.source = obj.id;
        break;
      }
    }
    this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_BP_HISTORY, parameterObject: saveObject }).then(response => {
      this.messageService.showMessage('Bank Product Header updated successfully', 'success');
      this.getBpHeaderAndHistoryDetails();
    });
  }

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description add new bp details
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  newRecord() {
    const self = this;
    // Todo
    let data = { 'customerId': this.customerID, 'lookupForBPIdentificationSource': this.sources };
    this.dialogService.custom(BankproductHistoryComponent, data, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
      (response) => {
        if (response === 'YES') {
          this.getBPHistoryDetails();
          this.getBankProductHeader();
        }
      }, (error) => {
        console.error(error);
      }
    );
  }


	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description set data as nonBankProductCustomer
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  nonBankProductCustomer() {
    // Open dialog for conformation before Change
    const dialogData = { title: 'Confirmation', text: `Are you sure you want to set this customer as a non Bank Product Customer?` };
    this.dialogService.confirm(dialogData, {}).result.then(
      (result) => {
        if (result === 'YES') {
          this.commonApiService.getPromiseResponse({ apiName: APINAME.SET_NOOFBP_CUSTOMER, parameterObject: { customerId: this.customerID } }).then(response => {
            this.getBpHeaderAndHistoryDetails();
          }, error => {
          });
        }
      }, (error) => {
      }
    );
  }

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description Get sources data
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  public getLookupForSource() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_BP_IDENTIFICATION_SOURCE,isCachable:true }).then(response => {
      this.sources = response;
    });
  }

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description Get Bank Product Header Details
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  public getBankProductHeader() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BANK_PRODUCT_HEADER, parameterObject: { customerId: this.customerID } }).then(response => {
      this.bpHeader = response;
      if (this.bpHeader.updatedDate != undefined && this.bpHeader.updatedDate != '') {
        this.bpHeader.updatedDate = moment(this.bpHeader.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }
      if (this.bpHeader.createdDate != undefined && this.bpHeader.createdDate != '') {
        this.bpHeader.createdDate = moment(this.bpHeader.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
      }
      this.CDRService.callDetectChanges(this.cdr);
    }, error => {
    });
  };


	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description Get Bank Product Details History Details and bind in grid
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  public getBPHistoryDetails() {
    this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BP_HISTORY_DETAILS, parameterObject: { customerId: this.customerID } }).then(response => {
      if (response && response.length > 0) {
        this.bpHistoryDetails = response.sort(function (a, b) {
          a = new Date(a.createdDate);
          b = new Date(b.createdDate);
          return b - a;
        });

        for (const obj of this.bpHistoryDetails) {
          if (obj.isHeader == true) {
            obj.isSelected = true;
          }
          if (obj.createdDate != undefined && obj.createdDate != '') {
            obj.createdDate = moment(obj.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          }
          if (obj.updatedDate != undefined && obj.updatedDate != '') {
            obj.updatedDate = moment(obj.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
          }
          this.customerBPHistoryDetailsRowData = this.bpHistoryDetails;
        }
      } else {
        this.bpHistoryDetails = [];
      }
      this.activitySearchDetailsService.preserveGridData(this.bpHistoryDetails);
      this.CDRService.callDetectChanges(this.cdr);

    }, error => {
      console.error(error);
    });
  };


	/**
	 *
	 *
	 * @memberof CustomerBankproductHeaderDetailComponent
	 */
  getBpHeaderAndHistoryDetails() {
    this.getBPHistoryDetails() // Bank Product Details History
    this.getBankProductHeader();
  }

  ngOnInit() {
    this.getLookupForSource();
    this.getBpHeaderAndHistoryDetails();

    /**
 * subscribe event to get minimized activity when activity close and
 * redraw grid to remove highlighted class
*/
    this.ticketActivityOverlayService.arrayList.subscribe((result: any) => {
      let opendedActivitiesFormHeader = result.list.map((openActivity: any) => openActivity.id);
      if (opendedActivitiesFormHeader.length !== this.opendedActivities.length && result.type !== 'maximized') {
        this.opendedActivities = opendedActivitiesFormHeader;
        this.customerBPHistoryDetailsGridApi.redrawRows();
      }
    });

    /**
    * subscribe event to get activityId when activity close and
    * call fun to remove id from clientIdsObject
    */
    this.ticketActivityOverlayService.closeActivityId.subscribe((closeActivityId) => {
      this.activitySearchDetailsService.removeClientIdsOnClose(closeActivityId);
      if (this.opendedActivities && this.opendedActivities.length > 0) {
        let i = this.opendedActivities.findIndex(openActivityId => openActivityId === closeActivityId);
        if (i > -1) {
          this.opendedActivities.splice(i, 1);
        }
        this.customerBPHistoryDetailsGridApi.redrawRows();
      }
    });


  }
  ngOnChanges() {
    if (this.customerID) {
      this.getBpHeaderAndHistoryDetails();
    }
  }
}
