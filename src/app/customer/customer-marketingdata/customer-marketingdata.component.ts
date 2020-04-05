// External imports
import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	ViewEncapsulation,
	Input,
	ChangeDetectorRef
} from "@angular/core";

//Internal imports
import { MessageService, CommonApiService, CDRService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";


@Component({
	selector: 'app-customer-marketingdata',
	templateUrl: 'customer-marketingdata.component.html',
	styleUrls: ['./customer-marketingdata.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class CustomerMarketingdataComponent implements OnInit {

	// get from service
	@Input() customerID;
	@Input() isTaxVisionReseller;

	// bind values
	public QMSBankCode: any;
	public couponList: any = [{ 'id': 'Portal1', 'name': 'Portal1' }, { 'id': 'Portal2', 'name': 'Portal2' }, { 'id': 'None', 'name': 'None' }]
	public postCardCampaignCoupon: string = null;
	public domLayout;
	public getRowHeight;
	// grid data
	public defaultColDef: any;
	public marketingdataDetailRowData: any;
	public marketingdataDetailColumnDefs: any;
	public marketingdataDetailGridApi: any;
	public softwareDetailRowData: any;
	public softwareDetailColumnDefs: any;
	public softwareDetailGridApi: any;


	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef
	) {
		this.marketingdataDetailColumnDefs = [
			{
				headerName: 'Tax Season',
				field: 'year',
				width: 230,
				headerTooltip: 'Tax Season',
			},
			{
				headerName: 'Accepted Return(s)',
				field: 'acceptedReturnCount',
				width: 230,
				headerTooltip: 'Accepted Return(s)',
				type: 'numericColumn'
			},
			{
				headerName: 'Rejected Return(s)',
				field: 'rejectedReturnCount',
				width: 230,
				headerTooltip: 'Rejected Return(s)',
				type: 'numericColumn'
			},
		];
		this.softwareDetailColumnDefs = [
			{
				headerName: 'Tax Season',
				field: 'year',
				width: 230,
				headerTooltip: 'Tax Season',
			},
			{
				headerName: 'No. Of Bank Products',
				field: 'noOfBankProducts',
				width: 230,
				headerTooltip: 'No. Of Bank Products',
				type: 'numericColumn'
			},
			{
				headerName: 'Tax Preparation S/W in use',
				field: 'softwareCustRenewedWith',
				width: 245,
				headerTooltip: 'Tax Preparation S/W in use',
			},
		];

		this.defaultColDef = {
			enableValue: true,
			enableRowGroup: true,
			sortable: true,
			resizable: true,
			tooltip: (p: any) => {
				return p.value;
			},
			lockPosition: true,
			enableBrowserTooltips: true
		};
		this.domLayout = "autoHeight";
	}


	onMarketingDataDetailGridReady(params) {
		this.marketingdataDetailGridApi = params.api;
		params.api.sizeColumnsToFit();
	}

	onSoftwareDetailGridReady(params) {
		this.softwareDetailGridApi = params.api;
		params.api.sizeColumnsToFit();
	}

	// 
	saveCoupon() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_CAMPAIGN_COUPON, parameterObject: { customerId: this.customerID, PostCardCampaignCoupon: this.postCardCampaignCoupon }, showLoading: true }).then(
			response => {
				this.messageService.showMessage("PostCard Campaign Coupon Updated Successfully", "success");
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				this.messageService.showMessage("PostCard Campaign Coupon Updated UnSuccessfully", "error");
			}
		);
	}

	// 
	public saveCode() {
		const saveDetails = { 'customerId': this.customerID, 'QMSBankCode': this.QMSBankCode ? this.QMSBankCode : '' };
		this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_QMS_BANK_CODE, parameterObject: saveDetails, showLoading: true }).then(
			response => {
				this.messageService.showMessage("QMS bank code saved successfully", "success");
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				this.messageService.showMessage("QMS bank code saved UnSuccessfully", "error");
			}
		);
	}

	// To get marketingdata details at initialization
	public initGetMarketingData() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_MARKETING_DATA, parameterObject: { customerId: this.customerID } }).then(response => {
			if (response !== undefined && response.FOIA !== undefined) {
				// create array from key value
				const responseArray = [];
				for (const key in response.FOIA) {
					if (response.FOIA.hasOwnProperty(key)) {
						responseArray.push({ year: key, acceptedReturnCount: response.FOIA[key].acceptedReturnCount, rejectedReturnCount: response.FOIA[key].rejectedReturnCount })
					}
				}
				this.marketingdataDetailRowData = responseArray ? responseArray : [];
			} else {
				this.marketingdataDetailRowData = [];
			}
			if (response !== undefined && response.marketingDetails !== undefined) {
				this.softwareDetailRowData = response.marketingDetails ? response.marketingDetails : [];
				this.CDRService.callDetectChanges(this.cdr);
			} else {
				this.softwareDetailRowData = [];
			}
			if (response && response.PostCardCampaignCoupon) {
				this.postCardCampaignCoupon = response.PostCardCampaignCoupon
			} else {
				this.postCardCampaignCoupon = undefined;
			}
			this.CDRService.callDetectChanges(this.cdr);
		});
	};

	// To get Qms bank code at initialization
	public getQMSBankCode() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.QMS_BANK_CODE, parameterObject: { customerId: this.customerID } }).then(response => {
			this.QMSBankCode = response.QMSBankCode;
			this.CDRService.callDetectChanges(this.cdr);
		});
	};


	public bindMarketingData(): void {
		if (this.isTaxVisionReseller == true) {
			this.getQMSBankCode();
		} else {
			this.initGetMarketingData();
		}
	};

	ngOnInit() {
		this.bindMarketingData();
		// this.customerId = 'e597c91c-5d52-4fd6-9b4d-0108f5bf079d';
		// this.isTaxVisionReseller = false;
	}
}