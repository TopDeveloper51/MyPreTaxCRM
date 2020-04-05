import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone'

//Internal imports
import { MessageService, CommonApiService, CDRService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";


@Component({
	selector: 'app-customer-bankproduct-enrollment-status',
	templateUrl: 'customer-bankproduct-enrollment-status.component.html',
	styleUrls: ['./customer-bankproduct-enrollment-status.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,

})

export class CustomerBankproductEnrollmentStatusComponent implements OnInit {


	@Input() unidentifiedCustomer: any
	@Input() customerID: any
	//
	public bankSpecialPricingForm: FormGroup;
	public startRefresh: boolean = false;
	// grid data
	public defaultColDef: any;
	public customerEnrollmentStatusRowData: any;
	public customerEnrollmentStatusColumnDefs: any;
	public customerEnrollmentStatusGridApi: any;


	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,

	) {

		this.customerEnrollmentStatusColumnDefs = [
			{
				headerName: 'Year',
				field: 'year',
				width: 100,
				headerTooltip: 'Year',
			},
			{
				headerName: 'Bank',
				field: 'bank',
				width: 150,
				headerTooltip: 'Bank',
			},
			{
				headerName: 'Status',
				field: 'status',
				width: 150,
				headerTooltip: 'Status',
			},
			{
				headerName: 'Office',
				field: 'officeName',
				width: 250,
				headerTooltip: 'Office',
			},
			{
				headerName: 'EFIN',
				field: 'efin',
				width: 100,
				headerTooltip: 'EFIN',
			},
			{
				headerName: 'Submission Date',
				field: 'submissionDate',
				width: 200,
				headerTooltip: 'Submission Date',
			},
			{
				headerName: 'Rejection Code/Message',
				field: 'rejectionDetails',
				width: 200,
				headerTooltip: 'Rejection Code/Message',
				cellRenderer: params => {
					let element = `<span>`;
					if (params.value) {
						for (let obj of params.value) {
							if (obj.errorCode != undefined) {
								element += `${obj.errorCode}`
							}
							if (obj.errorMessage != undefined) {
								element += `,${obj.errorMessage}`
							}
						}
					}
					element += "</span>";
					return element;

				}
				,
				tooltip: () => {
					return '';
				}
			},
		];

		this.defaultColDef = {
			enableValue: true,
			enableRowGroup: true,
			sortable: false,
			tooltip: (p: any) => {
				return p.value;
			},
			resizable: true,
			lockPosition: true,
			enableBrowserTooltips: true
		};
	}

	onGridReady(params) {
		this.customerEnrollmentStatusGridApi = params.api;
		params.api.sizeColumnsToFit();
	}

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description get bank details and bind data in grid
	 * @memberof CustomerBankproductEnrollmentStatusComponent
	 */
	public getBPEnrollmentDetails() {
		let self = this;
		self.startRefresh = true;
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BP_ENROLLMENT_DETAILS, parameterObject: { customerId: this.customerID } }).then(
			response => {
				if (response && response.length > 0) {
					for (const i of response) {
						i.submissionDate = moment(i.submissionDate).format('MM/DD/YYYY hh:mm A');
					}
				}
				self.customerEnrollmentStatusRowData = response;
				self.startRefresh = false;
				self.CDRService.callDetectChanges(self.cdr);
			},
			error => {
				self.customerEnrollmentStatusRowData = [];
				self.startRefresh = false;
				self.CDRService.callDetectChanges(self.cdr);
			});
	};

	/********************************  Special Pricing  ***********************************/

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description save bank SpecialPricing data
	 * @memberof CustomerBankproductEnrollmentStatusComponent
	 */
	public saveSpecialPricing() {
		if (this.bankSpecialPricingForm.valid) {
			this.commonApiService.getPromiseResponse({ apiName: APINAME.UPDATE_SPECIAL_PRICING, parameterObject: this.bankSpecialPricingForm.value, showLoading: true }).then(response => {
				if (response) {
					this.messageService.showMessage('Special Pricing updated successfully', 'success');
				}
			}, error => {
				if (error.code === 4048) {
					this.messageService.showMessage('Customer Number Does Not Exists.', 'error');
				}
				if (error.code === 4049) {
					this.messageService.showMessage(' Customer Is Not License Holder.', 'error');
				}
			});
		}
	}


	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description create form
	 * @memberof CustomerBankproductEnrollmentStatusComponent
	 */
	initBankSpecialPricingForm() {
		this.bankSpecialPricingForm = this.fb.group({
			transmitterFee: ['', Validators.required],
			addOnTransmitterSharePer: ['', Validators.required],
			addOnPPSharePer: ['', Validators.required],
			customerId: this.customerID
		})
	}

	/**
	 * @author Dhruvi Shah
	 * @date 20-12-2019
	 * @description get bankSpecialPricing data from api and set bankSpecialPricing data in form
	 * @memberof CustomerBankproductEnrollmentStatusComponent
	 */
	public getBankProductHeader() {
		let self = this;
		self.startRefresh = true;
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BANK_PRODUCT_HEADER, parameterObject: { customerId: this.customerID } }).then(response => {
			let bankSpecialPricing = response.bankSpecialPricing ? response.bankSpecialPricing : {};
			this.bankSpecialPricingForm.patchValue(bankSpecialPricing);
			self.startRefresh = false;
			this.CDRService.callDetectChanges(this.cdr);
		}, error => {
			self.startRefresh = false;
		});
	};


	refreshData() {
		this.getBPEnrollmentDetails(); // get data to bind in Bank Product Enrollment Status Details
		this.getBankProductHeader(); // get bankSpecialPricing data
	}


	ngOnInit() {
		this.initBankSpecialPricingForm(); // create form for Special Pricing
		this.refreshData();
	}
	ngOnChanges() {
		if (this.customerID) {
			this.getBPEnrollmentDetails();
		}
	}
}