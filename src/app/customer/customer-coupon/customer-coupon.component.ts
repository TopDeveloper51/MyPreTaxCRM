// External imports
import {
	Component,
	ChangeDetectionStrategy,
	OnInit, Input,
	ChangeDetectorRef,
	ViewEncapsulation
} from "@angular/core";
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

// Internal imports
import { CDRService, CommonApiService, DialogService } from '@app/shared/services';
import { APINAME } from "@app/customer/customer-constants";
import { CustomerCouponDialogComponent } from "@app/customer/dialogs/customer-coupon-dialog/customer-coupon-dialog.component";

@Component({
	selector: 'app-customer-coupon',
	templateUrl: './customer-coupon.component.html',
	styleUrls: ['./customer-coupon.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})

export class CustomerCouponComponent implements OnInit {

	@Input('customerID') customerID: string;
	@Input('unidentifiedCustomer') unidentifiedCustomer: boolean;

	public year = '';
	public couponList: any = [];

	public rowData: any;
	public gridApi;
	public columnDefs;
	public defaultColDef;
	public domLayout;


	constructor(
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private commonApiService: CommonApiService,
		private dialogService: DialogService,
		private datePipe: DatePipe
	) {
		const self = this;
		this.columnDefs = [
			{
				headerName: '', field: 'id', width: 1,
				cellStyle: { 'visibility': 'hidden' }
			},
			{
				headerName: 'Coupon Code', field: 'couponCode', width: 100, tooltipField: 'couponCode', sort: 'desc',
			},
			{
				headerName: 'Valid From', field: 'validFrom', width: 130, tooltipField: 'validFromTitle',
				cellRenderer: params => {
					if (params.data.validFrom !== 'Invalid date') {
						return params.data.validFrom ? moment(params.data.validFrom).format("DD/MM/YYYY") : '';
					}
				}
			},
			{
				headerName: 'Valid to', field: 'validTo', width: 130, tooltipField: 'validToTitle',
				cellRenderer: params => {
					if (params.data.validTo !== 'Invalid date') {
						return params.data.validTo ? moment(params.data.validTo).format("DD/MM/YYYY") : '';
					}
				}
			},
			{
				headerName: 'Package Type', field: 'packageType', width: 150,
				cellRenderer: params => {
					switch (params.value) {
						case 'AS' + self.year + 'INDPRO':
							return 'IndividualPro';
						case 'AS' + self.year + 'ESSPRO':
							return 'Essential';
						case 'AS' + self.year + 'UNLPRO':
							return 'Unlimited';
						case 'ASFREESOFT100':
							return 'FreeSoftware100';
						case 'ASFREESOFT200':
							return 'FreeSoftware200';
						case 'ASFREESOFT300':
							return 'FreeSoftware300';
						case 'ASFREESOFT500':
							return 'FreeSoftware500';
						case 'ASFREESOFT1000':
							return 'FreeSoftware1000';
						default:
							return 'FREE';
					}
				}
			},
			{ headerName: 'Discount Price', field: 'discountPrice', width: 150, tooltipField: 'discountPrice', type: 'numericColumn', },
			{
				headerName: 'IsUsed', field: 'isUsed', width: 150, tooltipField: 'isUsed',
				cellRenderer: params => {
					if (params.value) {
						return ` <img height="15px" width="15px" src="assets/images/Approved.png" style="text-align:center">`
					}
				},
				tooltip: () => {
				  return '';
				}
			},
			{
				headerName: 'Used Date', field: 'usedDate', width: 150, tooltipField: 'usedDateTitle',
				cellRenderer: params => {
					if (params.data.usedDate !== 'Invalid date') {
						return params.data.usedDate ? moment(params.data.usedDate).format("DD/MM/YYYY") : '';
					}
				}
			},
			{ headerName: 'Used Plateform', field: 'usedPlateform', width: 130, tooltipField: 'usedPlateform' },

		];
		this.defaultColDef = {
			enableValue: true,
			suppressMovable: true,
			suppressMenu: true,
			tooltip: (p: any) => {
				return p.value;
			},
			sortable: true
		};
		this.domLayout = "autoHeight"
	}


	onGridReady(params) {
		this.gridApi = params.api;
		params.api.sizeColumnsToFit();
	}

	/**
     * @author Dhruvi shah
     * @date 16/12/2019
	 * @description fun call on row click to update coupon
	 * @param {*} params
	 * @memberof CustomerCouponComponent
	 */
	onRowClicked(params): void {
		let couponObj: any;
		couponObj = this.couponList.find(t => t.id == params.data.id);
		couponObj.customerId = this.customerID;
		this.openCouponDetail(couponObj)
	}

	/**
     * @author Dhruvi shah
     * @date 16/12/2019
	 * @description open dialog to add coupon
	 * @memberof CustomerCouponComponent
	 */
	addNewCoupon(): void {
		let couponObj = { 'customerId': this.customerID, 'isNew': true };
		this.openCouponDetail(couponObj)
	}

	/**
     * @author Dhruvi shah
     * @date 16/12/2019
	 * @param {object} couponObj
	 * @description open dialog to add / update coupon
	 * @memberof CustomerCouponComponent
	 */
	openCouponDetail(couponObj) {
		this.dialogService.custom(CustomerCouponDialogComponent, { couponObj }, { keyboard: true, backdrop: 'static', size: 'md' }).result.then(
			(response) => {
				if (response) {
					this.getCouponData();
				}
			}, (error) => {
				console.error(error);
			}
		);
	}

	/**
     * @author Dhruvi shah
     * @date 16/12/2019
	 * @description get Coupon Data from Api
	 * @memberof CustomerCouponComponent
	 */
	public getCouponData() {
		const self = this;
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ALL_COUPON, parameterObject: { customerId: this.customerID } }).then(response => {
			if (response !== undefined && response !== null && response.length > 0) {
				self.year = response[0].packageType.substr(2, 2);

				response.forEach(element => {
					if (element.validFrom) {
						element.validFromTitle = moment(element.validFrom).format('DD/MM/YYYY')
					}
					if (element.validTo) {
						element.validToTitle = moment(element.validTo).format('DD/MM/YYYY')
					}
					if (element.usedDate) {
						element.usedDateTitle = moment(element.usedDate).format('DD/MM/YYYY')
					}
				});

				self.rowData = response;
				self.couponList = response;
			} else {
				self.rowData = [];
				self.couponList = [];
			}
			this.CDRService.callDetectChanges(this.cdr);
		});
	};

	/**
     * @author Dhruvi shah
     * @date 16/12/2019
	 * @memberof CustomerCouponComponent
	 */
	ngOnInit() {
		this.getCouponData();
	}

}
