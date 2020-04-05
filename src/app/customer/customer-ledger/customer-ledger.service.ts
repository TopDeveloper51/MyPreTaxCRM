// External imports
import { Injectable } from "@angular/core";
import * as moment from 'moment-timezone';

// Internal imports
import { CommonApiService } from "@app/shared/services";
import { APINAME } from "@app/customer/customer-constants";
import { CustomerService } from "@app/customer/customer.service";


@Injectable()
export class CustomerLedgerService {

	constructor(
		private commonApiService: CommonApiService,
		private customerService: CustomerService
	) { }

	public getPGandCertificationDetailsByCustomerId(customerID) {
		return new Promise((resolve, reject) => {
			this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_PGANDCERTIFICATEDETAILS_CUSTOMER, parameterObject: { customerId: customerID }, showLoading: true }).then(
				response => {
					resolve(response);
				},
				error => {
					reject(error);
				}
			);
		});
	}


	public savePaymentCollectionInfo(paymentCollectionData) {
		return new Promise((resolve, reject) => {
			this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_PAYMENT_COLLECTION_INFO, parameterObject: paymentCollectionData, showLoading: true }).then(
				response => {
					resolve(response);
				},
				error => {
					reject(error);
				}
			);
		});
	}


	public getCountryStateLookup() {

		return new Promise((resolve, reject) => {
			const blankEntryReq = { blankEntryReq: ["state", "country"] };
			this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_SEARCH_LOOKUP,isCachable:true, parameterObject: blankEntryReq }).then(
				response => {
					let list: any = {
						licenseOfferType: [], responsiblePesronList: [], countryList: [], stateList: []
					};

					list.licenseOfferType = response.licenseOfferType;
					list.responsiblePesronList = response.responsiblePesronList;

					for (const obj of response.countryList) {
						list.countryList.push({ id: obj.value, name: obj.text });
					}
					for (const obj of response.stateList) {
						list.stateList.push({ id: obj.value, name: obj.text });
					}
					resolve(list);
				},
				error => {
					reject(error);
				}
			);
		});
	}


	public getledgerDetailsByCustomerId(customerID, offerList) {
		return new Promise((resolve, reject) => {
			this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LEDGER_DETAILS_CUSTOMER, parameterObject: { customerId: customerID } }).then(
				response => {
					if (response) {
						response.forEach(element => {
							element.dateTime = element.datetime ? moment(element.datetime).tz('US/Pacific').format('MM/DD/YY hh:mm A') : '';
							element.taxSeason = element.taxSeason && element.taxSeason.length > 0 ? element.taxSeason.sort() : '';
							element.taxSeasonInShort = JSON.parse(JSON.stringify(element.taxSeason))
							for (let ele in element.taxSeasonInShort) {
								element.taxSeasonInShort[ele] = element.taxSeasonInShort[ele].slice(-2);
							}

							if (element.offer && offerList && offerList.length > 0) {
								let obj = offerList.find(t => t.id === element.offer);
								element.offerName = obj.name;
							}
						});
						resolve(response);
					} else {
						resolve([]);
					}
				},
				error => {
					reject(error);
				}
			);
		});
	}

	public getPlans() {
		return new Promise((resolve, reject) => {
			this.customerService.getSubscriptionPackageName().then(
				(response: any) => {
					resolve(response);
				},
				error => {
					reject(error);
				}
			);
		});
	}

	public createSubscriptionOffer(customerId)
	{
		return new Promise((resolve,reject)=>{
			this.commonApiService.getPromiseResponse({apiName:APINAME.CREATE_OFFER_SUBSCRIPTION,parameterObject:customerId}).then((response:any)=>{
				resolve(response);
			},
			error=>{
				reject(error);
			});
		});
	}

	public saveNewTransactionDetails(saveTansactionReqData) {
		return new Promise((resolve, reject) => {
		  this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_TRANSACTION_DETAIL, parameterObject: saveTansactionReqData,showLoading:true }).then(
			response => {
			  resolve(response);
			},
			error => {
			  reject(error);
			}
		  );
		});
	  }
  
}