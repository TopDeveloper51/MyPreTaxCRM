//External imports
import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy,Output,EventEmitter } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';
import 'ag-grid-enterprise';

//Internal imports
import { CustomerLedgerService } from '@app/customer/customer-ledger/customer-ledger.service';
import { CDRService, MessageService, UserService, DialogService, CommonApiService, CopyToClipboardService } from '@app/shared/services';
import { APINAME } from "@app/customer/customer-constants";
import { CustomerAccountingDetailComponent } from '@app/customer-accounting/customer-accounting-detail/customer-accounting-detail.component';
import { LedgerInlineEditorComponent } from '@app/customer/components/ledger-inline-editor/ledger-inline-editor.component';

@Component({
	selector: 'app-customer-ledger',
	templateUrl: 'customer-ledger.component.html',
	styleUrls: ['customer-ledger.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [CustomerLedgerService, CurrencyPipe, DatePipe]
})

export class CustomerLedgerComponent implements OnInit {

	@Input('customerID') customerID: string;
	@Input('customerDetail') customerDetail: any;
	@Input('unidentifiedCustomer') unidentifiedCustomer: boolean;
	@Input('isTestCustomer') isTestCustomer: boolean;
	@Input('customerDisplayFlagOnLedger') customerDisplayFlagOnLedger: boolean;
	@Input('LedgerInfo') LedgerInfo;
	@Input('ledgerValue') ledgerValue: any;
	@Output('ledgerValueChange') ledgerValueChange = new EventEmitter<any>();
	@Input('originalLedgerDetails') originalLedgerDetails: any = {};
	@Output('originalLedgerDetailsChange') originalLedgerDetailsChange = new EventEmitter<any>();
	@Input() priceGuaranteeDetails: any = {};
	@Input() payPerReturn: any = [{}];
	@Input() priceGuaranteeDetailsPerYear: any = [];
	public showPayPerReturn: boolean = false;
	public isPayPerReturn: boolean = false;
	public getRowStyle;
	public startEditing:boolean;
	public taxYearList: any = [{ id: '2024', name: '2024' },{ id: '2023', name: '2023' }, { id: '2022', name: '2022' }, { id: '2021', name: '2021' }, { id: '2020', name: '2020' }, { id: '2019', name: '2019' }, { id: '2018', name: '2018' }, { id: '2017', name: '2017' }, { id: '2016', name: '2016' }, { id: '2015', name: '2015' }, { id: '2014', name: '2014' }];
	//
	public lookup: any = {
		plans: [], countryList: [], stateList: [], offerList: [], responsiblePersonList: []
	}
	public allowedIDsForTransactionDeletion = ["3fbbde83-b742-459d-86e4-9cad7d22137e"];
	public isAllowedForDelete: boolean = false;
	public maxDate: Date;
	public certificateDetails: any;

	//grid related variables
	public apiParam;
	public gridApi;
	public gridData: any;
	public gridColumnApi: any;
	public rowData;
	public columnDefs;
	public fullViewColumnDefs;
	public defaultColDef: any;
	public frameworkComponents: any;
	public currentEditRowIndex;
	public isFullView:boolean = false;
	constructor(
		private customerLedgerService: CustomerLedgerService,
		private messageService: MessageService,
		private userService: UserService,
		private commonApiService: CommonApiService,
		private clipboard: CopyToClipboardService,
		private dialogService: DialogService,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private currencyPipe: CurrencyPipe,
		private datePipe: DatePipe
	) {
		this.maxDate = moment().format('MM/DD/YY');
		const self = this;
		this.fullViewColumnDefs = [
			{
				// headerName: 'Trans. Date', headerTooltip: 'Transaction Date', field: 'datetime', width: 150, sort: 'asc', 
				// cellRenderer: params => {
				// 	return self.datePipe.transform(params.value, 'short');
				// }
				headerName: 'Trans. Date', headerTooltip: 'Transaction Date', field: 'datetime', width: 300, sort: 'asc',
				cellRenderer: params => {
					if(params.value && this.isFullView)
					{
						return self.datePipe.transform(params.value, 'short');
					}	
					else
					{
						return self.datePipe.transform(params.value, 'shortDate');
					}
				}
			},
			{
				headerName: 'G. Amt.', headerTooltip: 'Gross Amount', field: 'grossAmount',
				width: 200,
				cellRenderer: params => {
					return self.currencyPipe.transform(params.value, 'USD', 'symbol', '1.2-2');
				}
			},
			{
				headerName: 'Season', headerTooltip: 'Tax Season', field: 'taxSeasonInShort', width: 200, tooltipField: 'taxSeason',
				editable: true,
				//cellRenderer:'taxSeasonEditor',
				cellEditor: 'taxSeasonEditor',
			},
			{
				headerName: 'Plan',
				field: 'orderDetails',
				width: 200,
				cellRenderer: params => {
					let element = `<div>`;
					if (params.value && params.value.package) {
						for (let i = 0; i < params.value.package.length; i++) {
							element += `${params.value.package[i]}<br>`;
							if (i !== (params.value.package.length - 1)) {
								element += ','
							}
						}
					}
					element += "</div>";
					return element;
				},
			},
			{
				headerName: 'S. Type',
				headerTooltip: 'Sale Type',
				field: 'orderDetails',
				width: 200,
				cellRenderer: params => {
					let element = `<div>`;
					if (params.value && params.value.saleType) {
						for (let i = 0; i < params.value.saleType.length; i++) {
							element += `${params.value.saleType[i]}<br>`;
							if (i !== (params.value.saleType.length - 1)) {
								element += ','
							}
						}
					}
					element += "</div>";
					return element;
				},
			},
			{
				headerName: 'C. Amt.',
				headerTooltip: 'Commission Amount',
				field: 'orderDetails',
				width: 300,
				cellRenderer: params => {
					let element = `<div>`;
					if (params.value && params.value.orderPrice) {
						for (let i = 0; i < params.value.orderPrice.length; i++) {
							element += `${params.value.orderPrice[i]}<br>`;
							if (i !== (params.value.orderPrice.length - 1)) {
								element += ','
							}
						}

					}
					element += "</div>";
					return element;
				},
			},
			{
				headerName: 'C. Receiver',
				headerTooltip: 'Commission Receiver',
				field: 'orderDetails',
				width: 200,
				cellRenderer: params => {
					let element = `<div>`;
					if (params.value && params.value.commissionReceiver_Name) {
						for (let i = 0; i < params.value.commissionReceiver_Name.length; i++) {
							element += `${params.value.commissionReceiver_Name[i]}<br>`;
							if (i !== (params.value.commissionReceiver_Name.length - 1)) {
								element += ','
							}
						}

					}
					element += "</div>";
					return element;
				},
			},
			{ headerName: 'Type', headerTooltip: 'Type', field: 'type', width: 200 },
			{
				headerName: 'C. Cmnt', headerTooltip: 'Comment', field: 'orderDetails.comment', width: 160,
				cellRenderer: params => {
					let element = `<div>`;
					if (params.value && params.value !== undefined && params.value !== '' && params.value !== null) {
						for (let i = 0; i < params.value.length; i++) {
							if (params.value[i] && params.value[i] !== undefined && params.value[i] !== '' && params.value[i] !== null) {
								element += `<span title = '${params.value[i]}'>
							<i class="far fa-comment-dots" style="cursor:pointer"></i>
							</span>`;
							}
						}
					}
					element += "</div>";
					return element;
				},
			},
			{
				headerName: 'Cmnt', headerTooltip: 'Transaction Comment', field: 'comment', width: 300, tooltipField: 'comment',
				cellRenderer: params => {
					if (params.value && this.isFullView) {
						return `<i class="far fa-comment-dots" title='${params.value}' style="cursor:pointer"></i>`;
					}
					else
					{
						return params.value;
					}
				},
			},
			{ headerName: 'Offer', headerTooltip: 'Offer', field: 'offerName', width: 200,editable: true,
			   cellEditor: 'taxSeasonEditor'
			},
			//{ headerName: 'Cmnt', headerTooltip: 'Transaction Comment', field: 'comment', width: 180},
			{ headerName: 'Trans. Id', headerTooltip: 'Transaction Comment', field: 'transactionId', width: 180},
			{ headerName: 'Source', headerTooltip: 'Source', field: 'source', width: 180 },
			{ headerName: 'Processor', headerTooltip: 'Processor', field: 'processor', width: 180 },
			{
				headerName: 'Link(s)', headerTooltip: 'Activity Link(s)', field: 'activityId', width: 200,cellClass: 'textCenter',
				cellRenderer: params => {
					let element = `<div>
							<i class="fas fa-external-link-square-alt cursor-pointer" data-action-type="goToActivity"  title="Open Activity in a new tab"></div>`;
					return element;
				},
			},
			{
				headerName: '', field: 'isManualFinding', width: 50,
				cellRenderer: params => {
					if (params.value) {
						let element = ` <img height="15px" width="15px" title="Manual Finding" alt="Manual Finding" src="assets/images/Approved.png">`
						return element;
					}
				}
			},
			{
				headerName: '', field: 'refDocId', width: 50,
				cellRenderer: params => {
					if (params.value) {
						let element = ` <img data-action-type="toClipboard" height="15px" width="15px" title="Copy Payment Doc ID to clipboard" alt="Copy Payment Doc ID to clipboard" src="assets/images/copyToClipboard.png">`
						return element;
					}
				}
			},
			{
				headerName: '',
				field: 'refDocId',
				width: 50,
				cellRenderer: params => {
					if (self.isAllowedForDelete) {
						let element = `<a data-action-type="deleteContact" ><i class="far fa-trash-alt cursor-pointer font-15" aria-hidden="true" data-action-type="deleteContact" ></i></a>`
						return element;
					}
				}
			},
			{
				headerName: '',
				field: 'startEditing',
				width: 150,
				cellRenderer: params => {
					if (params.data.startEditing == false) {
						let element = `<a data-action-type="editRow">						
						<i class="fas fa-pencil-alt" style="font-size: 15px;" (click)="editRow()"
										title="Edit" data-action-type="editRow"></i></a>`
						return element;
					} else {
						let element = `<a data-action-type="saveRow">						
						<i class="far fa-save" style="font-size: 15px;padding-right:10px;" (click)="saveRow()"
										title="Save" data-action-type="saveRow"></i></a>
										<a data-action-type="closeRow">						
						<i class="fas fa-times" style="font-size: 20px;" (click)="closeRow()"
										title="Cancel" data-action-type="closeRow"></i></a>`
						return element;
					}
				}
			},
		];

		this.getRowStyle = (params) => {
			if (!params.data.id) {
				return { 'background-color': '#F0F8FF' };
			}
			return null;
		};

		this.defaultColDef = {
			enableValue: true,
			suppressMovable: true,
			suppressMenu: true,
			tooltip: (p: any) => {
				return p.value;
			},
			sortable: true
		};
		this.frameworkComponents = {
			taxSeasonEditor: LedgerInlineEditorComponent,
		}
	}

	onGridReady(params) {
		this.gridApi = params.api;
		params.api.sizeColumnsToFit();
		this.gridData = params.api;
		this.gridColumnApi = params.columnApi;
		this.isFullViewAgGridFlag();
	}

	public isFullViewAgGridFlag()
	{	
		if(this.isFullView)
		{
			this.gridColumnApi.setColumnVisible('comment', true);
			this.gridColumnApi.setColumnsVisible(['offerName','transactionId'], true);
			this.getledgerDetailsByCustomerId();
		}
		else
		{
			this.gridColumnApi.setColumnVisible('comment', true);
			this.gridColumnApi.setColumnsVisible(['offerName','transactionId'], false);
			this.getledgerDetailsByCustomerId();
		}
	}
	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @param {*} e
	 * @memberof CustomerContactComponent
	 */
	public onRowClicked(e) {
		if (e.event.target !== undefined) {
			const actionType = e.event.target.getAttribute("data-action-type");
			switch (actionType) {
				case "deleteContact":
					this.deleteTransaction(e.data.id);
					break;
				case "toClipboard":
					this.clipboard.copy(e.data.refDocId);
					break;
				case "editRow":
					this.startEditing = true;
					this.rowData[e.rowIndex].startEditing = !this.rowData[e.rowIndex].startEditing;
					if(this.currentEditRowIndex !== undefined && e.rowIndex !== this.currentEditRowIndex) {
						this.rowData[this.currentEditRowIndex].startEditing = false;
					}
					//this.gridApi.redrawRows();
					this.gridApi.refreshCells();
					this.editRow(e);
					break;
				case "saveRow":
					this.startEditing = true;
					this.rowData[e.rowIndex].startEditing = !this.rowData[e.rowIndex].startEditing;
					//this.gridApi.redrawRows();
					this.gridApi.refreshCells();
					this.saveRow(e.data);
					this.gridApi.stopEditing(true);
					break;
				case "closeRow":
					this.startEditing = true;
					this.rowData[e.rowIndex].startEditing = !this.rowData[e.rowIndex].startEditing;
					//this.gridApi.redrawRows();
					this.gridApi.refreshCells();
					this.gridApi.stopEditing(true);
					break;
				case "goToActivity":
					this.openActivity(e.data.activityId[0]);
					break;
				default:
					this.getPaymentDoc(e.data, "view")
					break;
			}
		}
	}

	public openActivity(activityId): void {
		window.open('/#/activity/details/' + activityId, '_blank')
	}

	editRow(event) {
		this.gridData.setFocusedCell(event.rowIndex, 'taxSeasonInShort');
		this.gridData.setFocusedCell(event.rowIndex, 'offerName');
		this.gridData.startEditingCell(
		{
			rowIndex: event.rowIndex,
			colKey: 'taxSeasonInShort',
		});
		this.gridData.startEditingCell({
			rowIndex: event.rowIndex,
			colKey: 'offerName',
		})
	}

	saveRow(e) {
		let parameterObject = e;
		let taxSeason = [];
		if (e.taxSeasonInShort) {
			e.taxSeasonInShort.forEach(element => {
				taxSeason.push('20'+element);
			});
		}
		parameterObject.taxSeason = taxSeason;
		if (parameterObject.taxSeasonInShort) {
			delete (parameterObject.taxSeasonInShort);
		}
		this.customerLedgerService.saveNewTransactionDetails(e).then((response) => {
			this.getledgerDetailsByCustomerId();
		});
	}

	public createSubscriptionOffer() {
		const dialogData = { title: 'Confirmation', text: 'Are you sure you want to create an offer over Subscription APP ?' };
		this.dialogService.confirm(dialogData, {}).result.then((result) => {
			if (result === 'YES') {
				this.customerLedgerService.createSubscriptionOffer({ customerId: this.customerID }).then(response => {
					if (response) {
						this.messageService.showMessage('Offer created successfully', 'success');
					} else {
						this.messageService.showMessage('Error occured while creating offer for the customer', 'error');
					}
				}, (error) => {
					this.messageService.showMessage(error.messageKey, 'error');
					console.log(error);
				});
			}
		}, (error) => {
			console.log(error);
		});
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 09/12/2019
	 * @param {string} transactionId
	 * @memberof CustomerLedgerComponent
	 */
	public deleteTransaction(transactionId: string) {
		const self = this;
		// Open dialog for conformation before Change Email Address
		const dialogData = { title: 'Confirmation', text: 'Are you sure you want to delete transaction?' };
		this.dialogService.confirm(dialogData, {}).result.then(
			(result) => {
				if (result === 'YES') {
					this.commonApiService
						.getPromiseResponse({
							apiName: APINAME.DELETE_ACCOUNT_TRANSACTION,
							parameterObject: { ID: 'ACCTRANS_' + transactionId },
							showLoading: true
						})
						.then(
							response => {
								self.getledgerDetailsByCustomerId();
								this.messageService.showMessage('Transaction is deleted successfully', 'success');
							},
							error => {
								this.messageService.showMessage('Error while deleting Transaction', 'error');
							}
						);
				}
			},
			(error) => {
				self.messageService.showMessage('Error occurred while processing.', 'error');
			}
		)
	}

	public getLedgerChanges(savedValue: boolean) {
		this.ledgerValue = JSON.parse(JSON.stringify(this.priceGuaranteeDetails));
		this.ledgerValue.saved = savedValue;
		this.ledgerValueChange.emit(this.ledgerValue);
		if (savedValue) {
			this.originalLedgerDetails.priceGuarantee = JSON.parse(JSON.stringify(this.priceGuaranteeDetails));
			this.originalLedgerDetailsChange.emit(this.originalLedgerDetails);
		}
	}
	/**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description new transaction dropdown dialog 
* @memberof CustomerLedgerComponent
*/ 
	public newTransaction(type) {
		let lookup = { licenseOfferType: this.lookup.offerList, taxYearList: this.taxYearList }
		// Open dialog;
		this.dialogService.custom(CustomerAccountingDetailComponent, { 'mode': 'new', 'customerData': { 'customerId': this.customerDetail.customerId, 'customerNumber': this.customerDetail.customerNumber }, 'lookup': lookup, 'transactionType': type, 'disableRemove': true, 'disableClose': true }, { keyboard: true, backdrop: true, size: 'lg' }).result.then((result) => {
			if (result === true) {
				this.getledgerDetailsByCustomerId();
			}
		});
	}

/**
* @author Satyam Jasoliya
* @createdDate 20-03-2020
* @description get payment document in ag-grid row click
* @memberof CustomerLedgerComponent
*/ 
	public getPaymentDoc(selectedRow: any, mode: any): void {
		if (selectedRow.id) {
			const self = this;
			let lookup = { licenseOfferType: this.lookup.offerList, taxYearList: this.taxYearList }
			this.dialogService.custom(CustomerAccountingDetailComponent, { 'mode': mode, 'selectedRow': selectedRow, 'availablePayment': this.rowData, 'length': this.rowData.length, 'lookup': lookup, 'disableRemove': true }, { keyboard: true, backdrop: true, size: 'xl' }).result.then((result) => {
				if (result === true) {
					this.getledgerDetailsByCustomerId();
				}
			});
		}
	}

	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	savePaymentCollectionInfo() {
		const self = this;
		let paymentCollectionData = { 'customerId': this.customerID, 'agreedPaymentCollectionDate': this.customerDetail.agreedPaymentCollectionDate ? moment(this.customerDetail.agreedPaymentCollectionDate).utc().format() : '', 'paymentDue': this.customerDetail.paymentDue, 'totalPayment': this.customerDetail.totalPayment }
		self.customerLedgerService.savePaymentCollectionInfo(paymentCollectionData).then(
			(response: any) => {
				if (response)
					this.messageService.showMessage('Payment Collection Info saved successfully', 'success');
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	public goToSubscriptionApp() {
		if (this.LedgerInfo.customerNumber && this.LedgerInfo.masterLocationId) {
			window.open('https://subscription.mytaxprepoffice.com/#/store?id=' + this.LedgerInfo.customerNumber + '&mLocation=' + this.LedgerInfo.masterLocationId + '&redirectUrl=https://app.mytaxprepoffice.com/#/home', '_blank');
		}
	}
	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	public save(): void {
		if (this.priceGuaranteeDetails.package == '' || this.priceGuaranteeDetails.package == null) {
			this.priceGuaranteeDetails.package = undefined;
		}
		if (this.priceGuaranteeDetails.amount == '' || this.priceGuaranteeDetails.amount == null) {
			this.priceGuaranteeDetails.amount = undefined;
		}
		if (this.priceGuaranteeDetails.date == '' || this.priceGuaranteeDetails.date == null) {
			this.priceGuaranteeDetails.date = undefined;
		}
		const saveDetails = { 'customerId': this.customerID, 'priceGuarantee': this.priceGuaranteeDetails };
		this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_PRICE_GUARANTEE_CUSTOMER, parameterObject: saveDetails }).then(response => {
			this.messageService.showMessage('Price Guarantee saved successfully', 'success');
			// Cloning ledger value for Customer Profile
			this.getLedgerChanges(true);
		});
	}


	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	public getPlans(): void {
		const self = this;
		self.customerLedgerService.getPlans().then(
			(response: any) => {
				this.lookup.plans = [];
				this.lookup.plans.push({ id: '', name: '' });
				for (const obj of response.plans) {
					this.lookup.plans.push({ id: obj.shortName, name: obj.displayText });
				}
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	public getledgerDetailsByCustomerId() {
		const self = this;
		self.customerLedgerService.getledgerDetailsByCustomerId(this.customerID, this.lookup.offerList).then(
			(response: any) => {
				response.forEach(element => {
					element.startEditing = false;
				});
				this.rowData = response ? response : [];
				self.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	public getCountryStateLookup() {
		const self = this;
		self.customerLedgerService.getCountryStateLookup().then(
			(response: any) => {
				this.lookup.countryList = response.countryList;
				this.lookup.stateList = response.stateList;
				this.lookup.offerList = response.licenseOfferType;
				this.lookup.responsiblePersonList = response.responsiblePesronList;
				//
				this.getledgerDetailsByCustomerId();
				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}

	/**
	 *
	 *
	 * @memberof CustomerLedgerComponent
	 */
	public getPGandCertificationDetailsByCustomerId() {
		const self = this;
		self.customerLedgerService.getPGandCertificationDetailsByCustomerId(this.customerID).then(
			(response: any) => {
				if (response != undefined && response.priceGuarantee != undefined) {
					this.priceGuaranteeDetails = response.priceGuarantee;
				} else {
					this.priceGuaranteeDetails = {};
				}
				//Price Guarantee per year start
				let noPGPerYearData = false;
				this.priceGuaranteeDetailsPerYear = [];
				if (response != undefined && response.priceGuaranteePerYear !== undefined) {
					if (Object.keys(response.priceGuaranteePerYear).length > 0) {
						for (const obj of Object.keys(response.priceGuaranteePerYear)) {
							response.priceGuaranteePerYear[obj].isAlreadyExisting = true;
							if (response.priceGuaranteePerYear[obj].addOnFeeAccounting && (Object.keys(response.priceGuaranteePerYear[obj].addOnFeeAccounting).length > 1 || Object.keys(response.priceGuaranteePerYear[obj].addOnFeeAccounting["checkToSendAddress"]).length > 0)) {
								response.priceGuaranteePerYear[obj].isAddOnfeeAccounting = true;
							} else {
								response.priceGuaranteePerYear[obj].isAddOnfeeAccounting = false;
							}
							this.priceGuaranteeDetailsPerYear.push({ 'year': obj, 'yearlyData': response.priceGuaranteePerYear[obj] });
						}
					} else {
						noPGPerYearData = true;
					}
				} else {
					noPGPerYearData = true;
				}
				if (noPGPerYearData) {
					let currentYear = moment().format('YYYY');
					this.priceGuaranteeDetailsPerYear.push({ 'year': currentYear, 'yearlyData': { isEnabled: false, addOnFeeAccounting: { checkToSendAddress: {} } } });
				}
				//Price Guarantee per year end

				//Pay per Return start
				if (response != undefined && response.payPerReturn !== undefined && response.payPerReturn.length > 0) {
					this.isPayPerReturn = true
					for (const obj of response.payPerReturn) {
						obj.isAlreadyExisting = true;
					}
					this.payPerReturn = response.payPerReturn;
				}

				// certificateDetails Start
				if (response != undefined && response.certificateDetails != undefined) {
					const certificateData = [];
					if (Object.keys(response.certificateDetails).length > 0) {
						certificateData.push(response.certificateDetails);
					}
					this.certificateDetails = certificateData;
				} else {
					this.certificateDetails = [];
				}
				this.getLedgerChanges(true);

				this.CDRService.callDetectChanges(this.cdr);
			},
			error => {
				console.error(error);
			}
		);
	}
	onDateChange() {
		setTimeout(() => {
			this.CDRService.callDetectChanges(this.cdr);
		}, 100);
	}

	ngOnChanges(): void {
		if (this.customerDetail) {
			if (this.customerDetail.agreedPaymentCollectionDate) {
				this.customerDetail.agreedPaymentCollectionDate = moment(this.customerDetail.agreedPaymentCollectionDate).tz('America/New_York').format('MM/DD/YY');
			}
			else {
				this.customerDetail.agreedPaymentCollectionDate = [null];
			}
		}
	}
	
	ngOnInit() {
		if (this.allowedIDsForTransactionDeletion.indexOf(this.userService.getUserDetail().id) > -1 || this.userService.getUserDetail().isTopManagementUser) {
			this.isAllowedForDelete = true;
		}
		this.getLedgerChanges(true);
		this.getPlans();
		this.getCountryStateLookup();
		this.getPGandCertificationDetailsByCustomerId();
	}
}