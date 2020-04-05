// External imports
import {
	Component,
	ChangeDetectionStrategy,
	OnInit, Input,
	ChangeDetectorRef
} from "@angular/core";

// Internal imports
import { CustomerLicenseService } from '@app/customer/customer-license/customer-license.service';
import { CustomerLicenseInformationComponent } from '@app/customer/dialogs/customer-license-information/customer-license-information.component';
import { CustomerLicenseRenewalAlertComponent } from '@app/customer/dialogs/customer-license-renewal-alert/customer-license-renewal-alert.component';
import { CDRService, MessageService, DialogService } from '@app/shared/services';

@Component({
	selector: 'app-customer-license',
	templateUrl: 'customer-license.component.html',
	styleUrls: ['./customer-license.component.scss'],
	providers: [CustomerLicenseService],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CustomerLicenseComponent implements OnInit {

	@Input('customerID') customerID: string;
	@Input('isTestCustomer') isTestCustomer: boolean;
	@Input('unidentifiedCustomer') unidentifiedCustomer: boolean;
	@Input('customerDetail') customerDetails: any;

	//
	public licenseSave: any = {}; // To hold license save data
	public customerDetail: any = {}; // store Information About customer
	public availableContactPerson: any = {}; // preson contact
	//grid related variables
	public apiParam;
	public gridApi;
	public domLayout;
	public gridData: any;
	public gridColumnApi: any;
	public rowData;
	public columnDefs;
	public enableBrowserTooltips;
	public defaultColDef: any;
	public getRowHeight;
	constructor(
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private messageService: MessageService,
		private dialogService: DialogService,
		private customerLicenseService: CustomerLicenseService) {

		const self = this;
		this.columnDefs = [
			{ headerName: 'Subscription Year', headerTooltip: 'Subscription Year', field: 'subscriptionYear', width: 180, sort: 'desc' },
			{
				headerName: 'Package', headerTooltip: 'Package', field: 'package',
				cellRenderer: params => {
					if (params.value != undefined) {
						let pkgName = params.value == 'FREE' ? 'Free Trial' : params.value;
						return pkgName;
					} else {
						return 'No Data Found';
					}
				}
			},
			{
				headerName: 'Individual', headerTooltip: 'Individual', field: 'individual', width: 120, cellStyle: { textAlign: 'center' },
				cellRenderer: params => {
					if (params.value) {
						let element = ` <img height="15px" width="15px" src="assets/images/Approved.png">`
						return element;
					}
				}
				,
				tooltip: () => {
					return '';
				}
			},
			{
				headerName: 'Business', headerTooltip: 'Business', field: 'business', width: 120, cellStyle: { textAlign: 'center' },
				cellRenderer: params => {
					if (params.value) {
						let element = ` <img height="15px" width="15px" src="assets/images/Approved.png">`
						return element;
					}
				},
				tooltip: () => {
					return '';
				}
			},
			{ headerName: 'Users', headerTooltip: 'Users', field: 'noOfUsers', cellStyle: { textAlign: 'center' }, width: 100 },
			{ headerName: 'Storage (GB)', headerTooltip: 'Storage (GB)', field: 'storage', cellStyle: { textAlign: 'right' }, width: 130 },
			{
				headerName: '',
				field: 'subscriptionType',
				width: 80,
				cellStyle: { textAlign: 'right', cursor: 'pointer' },
				cellRenderer: params => {
					if (params.data.subscriptionType == undefined && !self.unidentifiedCustomer) {
						return `<i class="font-15 cursor-pointer fa fa-plus"></i>`
					}
					if (params.data.subscriptionType != undefined && !self.unidentifiedCustomer) {
						return `<i class="font-15 cursor-pointer fas fa-pencil-alt"></i>`
					}
				},
				tooltip: () => {
					return '';
				}
			},
		];
		this.enableBrowserTooltips = true;
		this.defaultColDef = {
			enableValue: true,
			tooltip: (p: any) => {
				return p.value;
			},
			suppressMovable: true,
			suppressMenu: true
		};
		this.domLayout = "autoHeight";
	}



	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @param {*} params
	 * @memberof CustomerLicenseComponent
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
	 * @createdDate 06/12/2019
	 * @param {*} e
	 * @memberof CustomerLicenseComponent
	 */
	public onRowClicked(params) {
		this.openLicenseCard(params.data);
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description open dialog to add or edit licence details
	 * @param {*} selectedRowData
	 * @memberof CustomerLicenseComponent
	 */
	openLicenseCard(selectedRowData) {
		if (this.unidentifiedCustomer == false) {
			let subcription: any;
			subcription = selectedRowData;
			subcription.showAlert = false;
			subcription.showContinue = false;
			subcription.source = 'CRM';
			if (subcription.resellerId === undefined) {
				subcription.resellerId = this.customerDetail.resellerId;
			}
			/**  open master dialog */
			if (subcription.subscriptionType === undefined || subcription.subscriptionType === '') {

				if (this.customerDetail.masterLocationId === undefined || this.customerDetail.masterLocationId === '') {
					subcription.showAlert = true;

					if (this.customerDetail.customerName !== undefined && this.customerDetail.customerName !== '' &&
						this.availableContactPerson !== undefined && this.availableContactPerson.length > 0 &&
						this.availableContactPerson[0].firstName !== undefined && this.availableContactPerson[0].firstName !== '' &&
						this.availableContactPerson[0].lastName !== undefined && this.availableContactPerson[0].lastName !== '' &&
						this.availableContactPerson[0].email !== undefined && this.availableContactPerson[0].email !== '' &&
						this.availableContactPerson[0].phone !== undefined && this.availableContactPerson[0].phone !== '') {
						subcription.showContinue = true;
					} else {
						subcription.showContinue = false;
					}

				}
			}

			const currentData = JSON.parse(JSON.stringify(subcription));
			let data = {
				'licenseDetail': currentData,
				'isTestCustomer': this.isTestCustomer,
				'customerId': this.customerID,
			}
			this.dialogService.custom(CustomerLicenseInformationComponent, { data }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
				(response) => {
					if (response === true) {
						this.getLicenseDetail();
					} else if (response !== undefined && response !== '' && typeof response !== 'boolean') {
						this.dialogService.custom(CustomerLicenseRenewalAlertComponent, { 'data': { 'customerId': response } }, { keyboard: false, backdrop: 'static', size: 'lg' }).result.then(
							(response) => { },
							(error) => { console.error(error); }
						);
					}
				}, (error) => {
					console.error(error);
				}
			);
		}
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description Save Number of offices
	 * @memberof CustomerLicenseComponent
	 */
	public saveNumberOfOffices() {
		const self = this;
		self.customerLicenseService.saveNumberOfOffices(this.customerID, this.licenseSave.totalOffice).then(
			(response: any) => {
				if (response) {
					this.messageService.showMessage('Number Of Offices Saved Successfully', 'success');
					this.getLicenseDetail();
				} else {
					this.messageService.showMessage('Error While Save Number Of Offices. Please Try Again.', 'error');
				}
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				this.messageService.showMessage('Error While Save Number Of Offices. Please Try Again.', 'error');
			}
		);
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description Update storage Data Show in Ui
	 * @protected
	 * @memberof CustomerLicenseComponent
	 */
	protected showPlanData(): void {
		// Get and show plan data on UI
		if (this.rowData && this.rowData.length > 0) {
			for (const i in this.rowData) {
				if (this.rowData[i]['storage'] !== undefined && this.rowData[i]['storage'] !== 0) {
					if (this.rowData[i]['package'].toUpperCase() === 'FREE') {
						this.rowData[i]['storage'] = parseFloat((this.rowData[i]['storage'] / 1024).toFixed(2));
					} else {
						this.rowData[i]['storage'] = (this.rowData[i]['storage'] / 1024);
					}
				} else {
					this.rowData[i]['storage'] = undefined;
				}
			}
		}
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate  06/12/2019
	 * @description get lookup val 
	 * @memberof CustomerLicenseComponent
	 */
	public getLicenseDetail() {
		const self = this;
		self.customerLicenseService.getLicenseDetail(this.customerID).then(
			(response: any) => {
				// set row data
				self.rowData = response.LicenseStatus ? response.LicenseStatus : [];
				// set total office
				self.licenseSave.totalOffice = (response && response.noOfOffices) ? response.noOfOffices : '';
				// convert storage into GB
				this.showPlanData()
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate  06/12/2019
	 * @description get customer & contact Detail  
	 * @memberof CustomerLicenseComponent
	 */
	getCustomerAndContactPersonDetails() {
		const self = this;
		self.customerLicenseService.getCustomerAndContactPersonDetails(this.customerID).then(
			(response: any) => {
				// set customerDetail
				this.customerDetail = response.customerDetail;
				// set contact person
				this.availableContactPerson = response.availableContactPerson;

				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	ngOnChanges(changes: any): void {
		if (changes.customerID !== undefined && changes.customerID.previousValue !== undefined) {
			this.getLicenseDetail();
			this.getCustomerAndContactPersonDetails();
		}
	}


	ngOnInit() {
		this.getLicenseDetail();
		this.getCustomerAndContactPersonDetails();
	}
}