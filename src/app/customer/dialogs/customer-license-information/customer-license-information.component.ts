// External imports
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Internal imports
import { CommonApiService, MessageService, UserService } from '@app/shared/services';
import { APINAME } from '@app/customer/customer-constants';
import * as moment from 'moment-timezone';
import { CustomerService } from "@app/customer/customer.service";

@Component({
	selector: 'customer-license-information',
	templateUrl: 'customer-license-information.component.html',
	styleUrls: ['customer-license-information.component.scss']
})

export class CustomerLicenseInformationComponent implements OnInit {
	@Input() data: any;

	public isTestCustomer: boolean;
	public isDefaultReseller: boolean;
	public licenseInfomation: any = {};
	public customerID: string;
	public createdDate: any;
	public updatedDate: any;
	public lookup: any = [];
	public plane: any;
	public planned: any;
	public disableContinue: boolean;
	public showContinue: any;
	public isValidContactPerson: any;
	public contactPersonData: any;
	public licenseInformationForm: FormGroup;

	constructor(
		private commonApiService: CommonApiService,
		private messageService: MessageService,
		private userService: UserService,
		private fb: FormBuilder,
		public modal: NgbActiveModal,
		private customerService: CustomerService
	) { }

	// change value of total user, storage And price
	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call to when package value change and set value of total user, storage , price , individual,business
	 * @memberof CustomerLicenseInformationComponent
	 */
	public showPlan(): void {
		const self = this;
		setTimeout(() => {
			const SelectedPlan = this.planned.find(o => o.shortName === self.licenseInformationForm.controls['package'].value);
			if (SelectedPlan !== undefined && SelectedPlan !== null) {
				//
				self.licenseInformationForm.controls['price'].setValue(SelectedPlan.offerprice !== undefined ? parseInt(SelectedPlan.offerprice, undefined) : undefined);
				//
				self.licenseInformationForm.controls['individual'].setValue((SelectedPlan.allowIndividual === 'true' || SelectedPlan.allowIndividual === true) ? true : false);
				//
				self.licenseInformationForm.controls['business'].setValue((SelectedPlan.allowBusiness === 'true' || SelectedPlan.allowBusiness === true) ? true : false);
				//
				self.licenseInformationForm.controls['noOfUsers'].setValue((SelectedPlan.NoofUser !== undefined) ? parseInt(SelectedPlan.NoofUser, undefined) : undefined);
				//
				if (this.isDefaultReseller) {
					self.licenseInformationForm.controls['enableSignaturePad'].setValue((SelectedPlan.enableSignaturePad === 'true' || SelectedPlan.enableSignaturePad === true) ? true : false);
				} else {
					self.licenseInformationForm.controls['enableSignaturePad'].setValue(false);
				}
				self.licenseInformationForm.controls['enableSignaturePad'].setValue(false);
				//
				if (SelectedPlan.Storage !== undefined && SelectedPlan.Storage !== 0) {
					const Storages: string = (SelectedPlan.Storage / 1024).toString();
					if (self.licenseInformationForm.controls['package'].value.toUpperCase() === 'FREE') {
						self.licenseInformationForm.controls['storage'].setValue(parseFloat(parseFloat(Storages).toFixed(2)));
					} else {
						self.licenseInformationForm.controls['storage'].setValue(parseInt(Storages, undefined));
					}
				} else {
					self.licenseInformationForm.controls['storage'].setValue(undefined);
				}
			}
			//
			if (self.licenseInformationForm.controls['package'].value !== undefined && self.licenseInformationForm.controls['package'].value !== null && self.licenseInformationForm.controls['package'].value.toUpperCase() === 'FREE') {
				self.licenseInformationForm.controls['webLibrary'].setValue(null);
				self.licenseInformationForm.controls['transmitterFee'].setValue(null);
				self.licenseInformationForm.controls['serviceBureauFee'].setValue(null);
				self.licenseInformationForm.controls['serviceBureauSharePer'].setValue(null);
				self.licenseInformationForm.controls['priceGuarantee'].setValue(null);
			}
		}, 500);

	};

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call to when package value change
	 * @memberof CustomerLicenseInformationComponent
	 */
	formValueChange() {
		this.licenseInformationForm.controls.package.valueChanges.subscribe((data) => {
			if (data) {
				this.showPlan();
			}
		})
	}

	createLicenseInformationForm() {
		this.licenseInformationForm = this.fb.group({
			subscriptionYear: this.fb.control(this.licenseInfomation.subscriptionYear),
			resellerId: this.fb.control(this.licenseInfomation.resellerId),
			package: this.fb.control(this.licenseInfomation.package, [Validators.required]),
			noOfUsers: this.fb.control(this.licenseInfomation.noOfUsers, [Validators.required]),
			storage: this.fb.control(this.licenseInfomation.storage, [Validators.required]),
			individual: this.fb.control(this.licenseInfomation.individual),
			business: this.fb.control(this.licenseInfomation.business),
			webLibrary: this.fb.control(this.licenseInfomation.webLibrary),
			price: this.fb.control(this.licenseInfomation.price, [Validators.required]),
			transmitterFee: this.fb.control(this.licenseInfomation.transmitterFee),
			serviceBureauFee: this.fb.control(this.licenseInfomation.serviceBureauFee),
			serviceBureauSharePer: this.fb.control(this.licenseInfomation.serviceBureauSharePer),
			priceGuarantee: this.fb.control(this.licenseInfomation.priceGuarantee),
			enableSignaturePad: this.fb.control(this.licenseInfomation.enableSignaturePad),
			source: this.fb.control(this.licenseInfomation.source),
			contactPersonId: this.fb.control(this.licenseInfomation.contactPersonId),
		});
		this.formValueChange()
	}
	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call to save licence information
	 * @memberof CustomerLicenseInformationComponent
	 */
	public save() {
		const self = this;
		let licenseInfo = this.licenseInformationForm.value;
		if (this.licenseInformationForm.valid && licenseInfo.subscriptionYear !== undefined) {

			if (licenseInfo.price) {
				licenseInfo.price = parseInt(licenseInfo.price);
			}
			if (licenseInfo.package.toUpperCase() === 'FREE') {
				licenseInfo.subscriptionType = 'FREE';
			} else {
				licenseInfo.subscriptionType = 'ANNUAL';
			}
			if (licenseInfo.storage !== undefined && licenseInfo.storage !== 0) {
				licenseInfo.storage = licenseInfo.storage * 1024;
			}
			licenseInfo.customerId = this.customerID;
			if (licenseInfo.contactPersonId) {
				licenseInfo.mode = 'add';
			}
			else {
				licenseInfo.mode = 'edit';
			}
			this.commonApiService.getPromiseResponse({ apiName: APINAME.CUSTOMER_MANAGE_LICENSE, parameterObject: licenseInfo, showLoading: true }).then(response => {
				this.modal.close(true);
				this.messageService.showMessage('Subscription saved successfully', 'success');
			}, (error) => {
				if (error && error.code == 4022) {
					this.modal.close(error.data);
					this.messageService.showMessage(error.messageKey, 'error');
				}
			});
		}
	};

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call to check selectd customer has valid information
	 * @param {*} contactPersonId
	 * @memberof CustomerLicenseInformationComponent
	 */
	public checkIsContactHaveAllDetails(contactPersonId) {
		let selectedContactPersonId = this.contactPersonData.findIndex(t => t.contactId === contactPersonId);
		if (selectedContactPersonId !== -1) {
			if (this.contactPersonData[selectedContactPersonId].firstName !== undefined && this.contactPersonData[selectedContactPersonId].firstName !== ''
				&& this.contactPersonData[selectedContactPersonId].lastName !== undefined && this.contactPersonData[selectedContactPersonId].lastName !== '' &&
				this.contactPersonData[selectedContactPersonId].email !== undefined && ((this.contactPersonData[selectedContactPersonId].phone !== undefined && this.contactPersonData[selectedContactPersonId].phone !== '') || (this.contactPersonData[selectedContactPersonId].mobile !== undefined && this.contactPersonData[selectedContactPersonId].mobile !== ''))) {
				this.isValidContactPerson = true;
			}
			else {
				this.isValidContactPerson = false;
			}
		} else {
			this.isValidContactPerson = false;
		}
	};

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call when event emit from contact list if any changes occurs & set selected contactId and validate buttons
	 * @memberof CustomerLicenseInformationComponent
	 */
	public setContactPersonListLength(event) {
		this.contactPersonData = event;
		this.licenseInformationForm.controls['contactPersonId'].setValue(undefined);
		this.isValidContactPerson = false;
		if (event.length > 0) {
			if (event.length == 1) {
				this.licenseInformationForm.controls['contactPersonId'].setValue(event[0].contactId);
				this.checkIsContactHaveAllDetails(this.licenseInformationForm.controls['contactPersonId'].value);
				this.disableContinue = (event[0].firstName.length >= 3 && event[0].lastName.length >= 3) ? false : true;
			}
			this.showContinue = true;
		} else {
			this.showContinue = false;
		}
	};

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description fun call when event emit from contact list & set selected contactId and validate buttons
	 * @memberof CustomerLicenseInformationComponent
	 */
	public readContactId(event) {
		this.licenseInformationForm.controls['contactPersonId'].setValue(event.contactId);
		this.checkIsContactHaveAllDetails(this.licenseInformationForm.controls['contactPersonId'].value);
		this.disableContinue = (event.firstName.length >= 3 && event.lastName.length >= 3) ? false : true;
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description formatter create and Update date
	 * @memberof CustomerLicenseInformationComponent
	 */
	private getCreateAndupdateDate(): any {
		const tz = 'America/New_York'; // or whatever your time zone is
		if (this.licenseInfomation.createdDate !== undefined && this.licenseInfomation.createdDate !== '') {
			this.createdDate = moment(this.licenseInfomation.createdDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
		}
		if (this.licenseInfomation.updatedDate !== undefined && this.licenseInfomation.updatedDate !== '') {
			this.updatedDate = moment(this.licenseInfomation.updatedDate).tz('America/New_York').format('MM/DD/YY hh:mm A');
		}
	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description get license package details
	 * @memberof CustomerLicenseInformationComponent
	 */
	public getPlans() {
		this.customerService.getSubscriptionPackageName().then(
			(response: any) => {
				this.planned = response.plans;
				this.plane = [];
				for (const obj of this.planned) {
					this.plane.push({ id: obj.shortName, name: obj.displayText });
				}
			},
			error => {
			}
		);

	}

	/**
	 * @author Dhruvi Shah
	 * @createdDate 06/12/2019
	 * @description get lookup details to bind
	 * @memberof CustomerLicenseInformationComponent
	 */
	public getLookups() {
		this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_SUBSCRIPTIONLIST_LOOKUP,isCachable:true, parameterObject: ['taxbook'], showLoading: true }).then(response => {
			this.lookup = response;
		});
	}

	ngOnInit() {
		this.isDefaultReseller = this.userService.isDefaultReseller();
		this.customerID = this.data.data.customerId;
		this.isTestCustomer = this.data.data.isTestCustomer;
		this.licenseInfomation = this.data.data.licenseDetail;
		this.getLookups();
		this.getPlans();
		this.getCreateAndupdateDate();
		this.createLicenseInformationForm();

	}
}