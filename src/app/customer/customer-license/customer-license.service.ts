// External imports
import { Injectable } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";


@Injectable()
export class CustomerLicenseService {

	constructor(
		private commonApiService: CommonApiService
	) { }


	public saveNumberOfOffices(customerID, noOfOffice) {
		return new Promise((resolve, reject) => {
			this.commonApiService
				.getPromiseResponse({
					apiName: APINAME.SAVE_NO_OF_OFFICES,
					parameterObject: { customerId: customerID, noOfOffices: noOfOffice },
					showLoading: true
				})
				.then(
					response => {
						if (response) {
							resolve(response);
						} else {
							reject();
						}
					},
					error => {
						reject(error);
					}
				);
		});
	}


	public getAvailableContactPerson(customerID) {
		return new Promise((resolve, reject) => {
			this.commonApiService
				.getPromiseResponse({
					apiName: APINAME.CUSTOMER_CONTACTLIST,
					parameterObject: { customerID: customerID },
					showLoading: true
				})
				.then(
					response => {
						if (response) {
							resolve(response);
						} else {
							reject();
						}
					},
					error => {
						reject(error);
					}
				);
		});
	}

	public getCustomerAndContactPersonDetails(customerID) {
		return new Promise((resolve, reject) => {
			this.commonApiService
				.getPromiseResponse({
					apiName: APINAME.GET_CUSTOMER_DETAILS,
					parameterObject: { customerID: customerID },
					showLoading: true
				})
				.then(
					response => {
						if (response) {
							let data = {
								customerDetail: response, availableContactPerson: {},
							}
							data.availableContactPerson = this.getAvailableContactPerson(customerID)
							resolve(data);
						} else {
							reject();
						}
					},
					error => {
						reject(error);
					}
				);
		});
	}

	public getLicenseDetail(customerID) {
		return new Promise((resolve, reject) => {
			this.commonApiService
				.getPromiseResponse({
					apiName: APINAME.GET_SUBSCRIPTIONLIST_BY_LOCID,
					parameterObject: { customerId: customerID },
					showLoading: true
				})
				.then(
					response => {
						if (response) {
							resolve(response);
						} else {
							reject();
						}
					},
					error => {
						reject(error);
					}
				);
		});
	}

}