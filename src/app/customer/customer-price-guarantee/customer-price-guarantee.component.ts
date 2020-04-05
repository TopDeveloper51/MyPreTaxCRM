import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment-timezone';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from "@angular/forms";

import { CDRService, MessageService, DialogService, CommonApiService } from '@app/shared/services';
import { PriceGuaranteeYearHistoryComponent } from '@app/customer/dialogs/price-guarantee-year-history/price-guarantee-year-history.component';
import { CustomerContactDetailComponent } from '@app/customer/dialogs/customer-contactDetail/customer-contactDetail.component';
import { APINAME } from "@app/customer/customer-constants";

@Component({
	selector: 'app-customer-price-guarantee',
	templateUrl: 'customer-price-guarantee.component.html',
	styleUrls: ['customer-price-guarantee.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CustomerPriceGuaranteeComponent implements OnInit {

	@Input('priceGuaranteeDetailsPerYear') priceGuaranteeDetailsPerYear: any;
	@Input('plans') plans: any = [];
	@Input('stateList') stateList: any = [];
	@Input('customerID') customerID: string;
	@Input('isTestCustomer') isTestCustomer: boolean;
	@Input('isPayPerReturn') isPayPerReturn: boolean;
	@Input('payPerReturn') payPerReturn: any = [{}];


	public taxYearList: any = [{ id: '2023', name: '2023' }, { id: '2022', name: '2022' }, { id: '2021', name: '2021' }, { id: '2020', name: '2020' }, { id: '2019', name: '2019' }, { id: '2018', name: '2018' }, { id: '2017', name: '2017' }, { id: '2016', name: '2016' }, { id: '2015', name: '2015' }, { id: '2014', name: '2014' }];
	public priceGuaranteeForm: FormGroup;
	public payPerReturnForm: FormGroup;
	public contactList: any = {};

	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private CDRService: CDRService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
	) { }

	public savePGPerYear(pgData, index) {
		if (pgData.value.date) {
			pgData.value.date = moment(pgData.value.date).utc().format();

		}
		if (pgData.value.firstThreatDate) {
			pgData.value.firstThreatDate = moment(pgData.value.firstThreatDate).utc().format();
		}
		if (pgData.value.PGlostDate) {
			pgData.value.PGlostDate = moment(pgData.value.PGlostDate).utc().format();

		}
		var objToSave: any = JSON.parse(JSON.stringify(pgData.value))
		objToSave.addOnFeeAccounting = { checkToSendAddress: {} };
		// objToSave.date =
		if (objToSave.name || objToSave.address1 || objToSave.city || objToSave.zipCode || objToSave.state) {
			objToSave.addOnFeeAccounting.checkToSendAddress = {
				name: objToSave.name,
				address1: objToSave.address1,
				city: objToSave.city,
				zipCode: objToSave.zipCode,
				state: objToSave.state,
			}
		}
		delete objToSave.name;
		delete objToSave.address1;
		delete objToSave.city;
		delete objToSave.zipCode;
		delete objToSave.state;
		delete objToSave.isAddOnfeeAccounting;
		delete objToSave.isAlreadyExisting;
		delete objToSave.showAddOnfeeAccounting;
		let saveObj = { 'customerId': this.customerID, 'priceGuaranteePerYear': objToSave };
		this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_PG_PER_YEAR, parameterObject: saveObj, showLoading: false }).then(response => {
			this.messageService.showMessage('Price Guarantee per Year saved successfully', 'success');
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[index].patchValue({ 'isAlreadyExisting': true });
			this.CDRService.callDetectChanges(this.cdr);
		});
	}

	getPGPerYearHistory(data) {
		let objHistory = {
			'customerId': this.customerID, 'year': data.value.year
		}
		this.dialogService.custom(PriceGuaranteeYearHistoryComponent, { objHistory }, { keyboard: true, backdrop: 'static', size: 'lg' }).result.then(
			(response) => {
			}, (error) => {
				console.error(error);
			}
		);
	}

	public getContactPersonList() {
		if (this.customerID !== undefined && this.customerID !== '') {
			const self = this;
			this.commonApiService.getPromiseResponse({ apiName: APINAME.CUSTOMER_CONTACTLIST, parameterObject: { customerID: this.customerID } }).then(response => {
				response.forEach(function (objData: any): any {
					objData.role.forEach(function (objField: any): any {
						if (objField == 'Add On Fee Accounting') {
							self.contactList = objData;
							self.contactList.name = self.contactList.firstName + ' ' + self.contactList.lastName
							self.contactList.phoneNumber = self.contactList.phone || self.contactList.mobile
						}
					});
				});
			});
		}
	}

	setContact() {
		let obj = { 'customerId': this.customerID, 'isTestCustomer': this.isTestCustomer }
		this.dialogService.custom(CustomerContactDetailComponent, { obj }, { keyboard: true, backdrop: 'static', size: 'xl' }).result.then((result) => {
			this.getContactPersonList();
			this.CDRService.callDetectChanges(this.cdr);
		});
	}

	private addPriceGuaranteeDetailPerYear() {
		const control = this.fb.group({
			year: '',
			isEnabled: false,
			package: ['', Validators.required],
			amount: ['', Validators.required],
			users: ['', Validators.required],
			storage: ['', Validators.required],
			date: ['', Validators.required],
			firstThreatDate: '',
			PGlostDate: '',
			showAddOnfeeAccounting: '',
			isAlreadyExisting: '',
			agreedShare: '',
			name: '',
			address1: '',
			city: '',
			state: '',
			zipCode: '',
			isAddOnfeeAccounting: '',
			createdDate: '',
			createdBy: '',
		});
		(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).push(control);
		this.onDateChange();
		this.CDRService.callDetectChanges(this.cdr);
	}

	/**
	  * @author Dhruvi Shah
	  * @createdDate 23-10-2019
	  * @memberof ActivitySearchComponent
	  */
	public initPriceGuaranteeForm() {
		this.priceGuaranteeForm = this.fb.group({
			priceGuaranteeDetail: new FormArray([]),
		})
		this.onDateChange();
		this.addPriceGuaranteeDetailPerYear(); // add department checkboxes in array
		this.CDRService.callDetectChanges(this.cdr);
	}

	/******************************************************Price Guarantee End******************************************************************* */

	savePayPerReturn() {
		let objToSave = JSON.parse(JSON.stringify(this.payPerReturnForm.value))
		for (let obj of objToSave.payPerReturn) {
			if (obj.buyDate) {
				obj.buyDate = moment(obj.buyDate).utc().format();
			}
			if (obj.isAlreadyExisting) {
				delete obj.isAlreadyExisting;
			}
		}
		let saveObj = { 'customerId': objToSave.customerId, 'payPerReturn': objToSave.payPerReturn };
		this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_PAY_PER_RETURN, parameterObject: saveObj, showLoading: true }).then(response => {
			this.messageService.showMessage('Pay per Return saved successfully', 'success');
			this.CDRService.callDetectChanges(this.cdr);
		});
	}

	deletePayPerReturnRow(index) {
		(this.payPerReturnForm.controls.payPerReturn as FormArray).removeAt(index);
	}

	addPayPerReturnBlock() {
		const control = this.fb.group({
			buyDate: ['', Validators.required],
			quantity: ['', Validators.required],
			isAlreadyExisting: false
		});
		(this.payPerReturnForm.controls.payPerReturn as FormArray).push(control);
		this.CDRService.callDetectChanges(this.cdr);
	}

	onDateChange() {
		setTimeout(() => {
			this.CDRService.callDetectChanges(this.cdr);
		}, 100);
	}

	/**
	  * @author Dhruvi Shah
	  * @createdDate 12-12-2019
	  * @memberof ActivitySearchComponent
	  */
	public initPayPerReturnForm() {
		this.payPerReturnForm = this.fb.group({
			customerId: this.customerID,
			payPerReturn: new FormArray([]),
		})
		this.addPayPerReturnBlock();
		this.onDateChange();
		this.CDRService.callDetectChanges(this.cdr);
	}

	ngOnChanges(): void {
		this.initPriceGuaranteeForm();
		this.initPayPerReturnForm();

		if (this.payPerReturnForm && this.payPerReturn && this.payPerReturn.length > 0) {
			this.payPerReturn.forEach((element, i) => {
				if (this.payPerReturnForm.controls.payPerReturn && (this.payPerReturnForm.controls.payPerReturn as FormArray).controls[i]) {
					(this.payPerReturnForm.controls.payPerReturn as FormArray).controls[i].patchValue({ 'buyDate': element.buyDate });
					(this.payPerReturnForm.controls.payPerReturn as FormArray).controls[i].patchValue({ 'quantity': element.quantity });
					(this.payPerReturnForm.controls.payPerReturn as FormArray).controls[i].patchValue({ 'isAlreadyExisting': element.isAlreadyExisting });
				}
			});
			this.CDRService.callDetectChanges(this.cdr);

		}
		if (this.priceGuaranteeForm && this.priceGuaranteeDetailsPerYear && this.priceGuaranteeDetailsPerYear.length > 0) {
			// this.priceGuaranteeDetailsPerYear.forEach((element, i) => {
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'year': this.priceGuaranteeDetailsPerYear[0].year });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'isEnabled': this.priceGuaranteeDetailsPerYear[0].yearlyData.isEnabled });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'package': this.priceGuaranteeDetailsPerYear[0].yearlyData.package, });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'amount': this.priceGuaranteeDetailsPerYear[0].yearlyData.amount, });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'users': this.priceGuaranteeDetailsPerYear[0].yearlyData.users, });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'storage': this.priceGuaranteeDetailsPerYear[0].yearlyData.storage, });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'date': this.priceGuaranteeDetailsPerYear[0].yearlyData.date });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'firstThreatDate': this.priceGuaranteeDetailsPerYear[0].yearlyData.firstThreatDate });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'PGlostDate': this.priceGuaranteeDetailsPerYear[0].yearlyData.PGlostDate });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'showAddOnfeeAccounting': this.priceGuaranteeDetailsPerYear[0].yearlyData.showAddOnfeeAccounting });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'isAlreadyExisting': this.priceGuaranteeDetailsPerYear[0].yearlyData.isAlreadyExisting });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'agreedShare': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.agreedShare });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'name': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.checkToSendAddress.name });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'address1': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.checkToSendAddress.address1 });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'city': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.checkToSendAddress.city });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'state': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.checkToSendAddress.state });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'zipCode': this.priceGuaranteeDetailsPerYear[0].yearlyData.addOnFeeAccounting.checkToSendAddress.zipCode });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'isAddOnfeeAccounting': this.priceGuaranteeDetailsPerYear[0].yearlyData.isAddOnfeeAccounting });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'createdDate': this.priceGuaranteeDetailsPerYear[0].yearlyData.createdDate });
			(this.priceGuaranteeForm.controls.priceGuaranteeDetail as FormArray).controls[0].patchValue({ 'createdBy': this.priceGuaranteeDetailsPerYear[0].yearlyData.createdBy });
			this.CDRService.callDetectChanges(this.cdr);
			// });
		}
		this.onDateChange();
		this.CDRService.callDetectChanges(this.cdr);
	}

	ngOnInit() {
	}
}