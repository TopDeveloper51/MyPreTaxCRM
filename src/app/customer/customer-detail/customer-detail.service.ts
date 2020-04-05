// External imports
import { Injectable } from "@angular/core";

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";
import { CustomerService } from "@app/customer/customer.service";

@Injectable()
export class CustomerDetailService {

    public lookup: any = {
        countryList: [],
        stateList: [],
        refundRequestFeeling: [],
        softwareList: [],
        salesProcessStatusList: [],
        preferredLanguageList: [],
        responsiblePesronList: [],
        bankList: [],
        customerTypeList: [],
        resellerList: [],
        SRFlagLookupForBPEnrollment: [],
        seasonReadinessFlagLookup: [],
        lookupForTrainFinStatus: [],
        lookupForEfinVerStatus: [],
        lookupForOfficeStatus: [],
        lookupForConversionStatus: [],
        lookupForConversionProformaStatus: [],
        paymentStatusList: [],
        trainingStatusList: []
    };



    constructor(private commonApiService: CommonApiService, private customerService: CustomerService) { }

    public getPackageName(customerId: string, subscriptionYear: string, packageLookup) {
        var LicenseTitle = 'License (None)';
        if (customerId !== undefined) {
            return new Promise((resolve, reject) => {
                this.commonApiService.getPromiseResponse({
                    apiName: APINAME.GET_SUBSCRIPTION_PACKAGENAME,
                    parameterObject: { 'customerId': customerId, 'subscriptionYear': subscriptionYear },
                    showLoading: false
                }).then(response => {
                    if (response !== undefined && response.package !== undefined && response.package !== '') {
                        if (response.package === 'FREE') {
                            LicenseTitle = 'License (Trial)';
                        } else {
                            for (const obj of packageLookup) {
                                if (response.package == obj.shortName) {
                                    LicenseTitle = 'License (' + obj.shortCode + ')';
                                    break;
                                }
                            }
                        }
                        resolve(LicenseTitle);
                    } else {
                        resolve(LicenseTitle);
                    }
                },
                    error => {
                        reject(error);
                    }
                );
            });
        }
    }


    /**
   * @author Dhruvi Shah
   * @createdDate 06/12/2019
   * @memberof CustomerDetailService
   */
    public getSubscriptionPackageName(customerId) {
        return new Promise((resolve, reject) => {
            this.customerService.getSubscriptionPackageName().then(
                (response: any) => {
                    resolve(this.getPackageName(customerId, '2018', response.plans));
                },
                error => {
                    reject(error);
                }
            );
        });
    }


    /**
   * @author Sheo Ouseph
   * @createdDate 02/12/2019
   * @updatedDate 31/01/2020
   * @description GET_CUSTOMER_DETAIL
   * @param {string} customerID
   * @memberof CustomerDetailService
   */
    public getCustomerDetails(customerID) {

        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({
                apiName: APINAME.GET_CUSTOMER_DETAIL,
                parameterObject: { customerID: customerID }
            }).then(response => {
                resolve(response);
            },
                error => {
                    reject(error);
                }
            );
        });
    }

    /**
   * @author Satyam Jasoliya
   * @createdDate 20/03/2020
   * @description get customer profile details
   * @param {string} customerID
   * @memberof CustomerDetailService
   */
    public getCustomerProfileDetails(customerID) {
        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({
                apiName: APINAME.GET_CUSTOMER_DETAILS,
                parameterObject: { customerID: customerID }
            }).then(response => {
                resolve(response);
            },
                error => {
                    reject(error);
                }
            );
        });
    }

    /**
   * @author Sheo Ouseph
   * @createdDate 02/12/2019
   * @param {string} customerID
   * @memberof CustomerDetailService
   */
    public getCustomerCardLookup(req) {

        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({
                apiName: APINAME.LOOKUP_CUSTOMER_DETAIL,
                isCachable:true,
                parameterObject: req
            }).then(response => {
                let lookupData = JSON.parse(JSON.stringify(response));
                lookupData.countryList = [];
                lookupData.stateList = [];
                lookupData.refundRequestFeelingList = [];
                for (const obj of response.countryList) {
                    lookupData.countryList.push({ id: obj.value, name: obj.text });
                }
                for (const obj of response.stateList) {
                    lookupData.stateList.push({ id: obj.value, name: obj.text, recordingPhoneConsent: obj.phoneRecordingConsent });
                }
                if (response.refundRequestFeeling && response.refundRequestFeeling.length > 0) {
                    for (const obj of response.refundRequestFeeling) {
                        if (obj.text == '') {
                            obj.text = 'Blank'
                        }
                        lookupData.refundRequestFeelingList.push({ id: obj.value, name: obj.text });
                    }
                }
                resolve(lookupData);
            },
                error => {
                    reject(error);
                }
            );
        });
    }

    /**
    * @author Dhruvi Shah
    * @createdDate 15/10/2019
    * @returns
    * @memberof CustomerSearchService
    */
    public getLookupForCustomer() {
        return new Promise((resolve, reject) => {
            this.commonApiService
                .getPromiseResponse({
                    apiName: APINAME.GET_CUSTOMER_SEARCH_LOOKUP,
                    isCachable:true,
                    parameterObject: {}
                })
                .then(
                    response => {
                        if (response) {
                            if (response.countryList && response.countryList.length > 0) {
                                this.lookup.countryList.push({ id: "blank", name: "Blank" });
                                for (const obj of response.countryList) {
                                    this.lookup.countryList.push({
                                        id: obj.value,
                                        name: obj.text
                                    });
                                }
                            }
                            if (response.stateList && response.stateList.length > 0) {
                                this.lookup.stateList.push({ id: "blank", name: "Blank" });
                                for (const obj of response.stateList) {
                                    this.lookup.stateList.push({ id: obj.value, name: obj.text });
                                }
                            }
                            if (
                                response.refundRequestFeeling &&
                                response.refundRequestFeeling.length > 0
                            ) {
                                for (const obj of response.refundRequestFeeling) {
                                    if (obj.text == '') {
                                        obj.text = 'Blank'
                                    }
                                    this.lookup.refundRequestFeeling.push({
                                        id: obj.value,
                                        name: obj.text
                                    });
                                }
                            }
                            if (response.softwareList && response.softwareList.length > 0) {
                                this.lookup.softwareList.push({ id: "blank", name: "Blank" });
                                for (const obj of response.softwareList) {
                                    this.lookup.softwareList.push({ id: obj.id, name: obj.name });
                                }
                            }

                            if (
                                response.salesProcessStatusList &&
                                response.salesProcessStatusList.length > 0
                            ) {
                                this.lookup.salesProcessStatusList.push({
                                    id: "blank",
                                    name: "Blank"
                                });
                                for (const obj of response.salesProcessStatusList) {
                                    this.lookup.salesProcessStatusList.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                }
                            }
                            if (
                                response.preferredLanguageList &&
                                response.preferredLanguageList.length > 0
                            ) {
                                this.lookup.preferredLanguageList.push({
                                    id: "blank",
                                    name: "Blank"
                                });
                                for (const obj of response.preferredLanguageList) {
                                    this.lookup.preferredLanguageList.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                }
                            }

                            for (const obj of response.bankList) {
                                this.lookup.bankList.push({ id: obj.id, name: obj.value });
                            }

                            for (const obj of response.customerTypeList) {
                                this.lookup.customerTypeList.push({
                                    id: obj.id,
                                    name: obj.name
                                });
                            }
                            for (const obj of response.resellerList) {
                                this.lookup.resellerList.push({ id: obj.id, name: obj.name });
                            }
                            for (const obj of response.paymentStatusList) {
                                this.lookup.paymentStatusList.push({
                                    id: obj.id,
                                    name: obj.name
                                });
                            }

                            for (const obj of response.trainingStatusList) {
                                this.lookup.trainingStatusList.push({
                                    id: obj.id,
                                    name: obj.name
                                });
                            }

                            for (const obj of response.seasonReadinessFlagList) {
                                if (
                                    obj.applicableForOnlyBankEnrollStatus != undefined &&
                                    obj.applicableForOnlyBankEnrollStatus == true
                                ) {
                                    this.lookup.SRFlagLookupForBPEnrollment.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                } else {
                                    this.lookup.seasonReadinessFlagLookup.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.SRFlagLookupForBPEnrollment.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.lookupForTrainFinStatus.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.lookupForEfinVerStatus.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.lookupForOfficeStatus.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.lookupForConversionStatus.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                    this.lookup.lookupForConversionProformaStatus.push({
                                        id: obj.id,
                                        name: obj.name
                                    });
                                }
                            }

                            for (const obj of response.responsiblePesronList) {
                                this.lookup.responsiblePesronList.push({
                                    id: obj.id,
                                    name: obj.name,
                                    group: obj.group
                                });
                            }
                            resolve(this.lookup);
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


    public saveCustomerDetails(customerDetail) {
        if (customerDetail.number !== undefined && customerDetail.number !== null && customerDetail.number !== '') {
            customerDetail.number = customerDetail.number.replace(/[^\w]/gi, '').trim();
        } else if (customerDetail.number == undefined || customerDetail.number == null) {
            customerDetail.number = '';
        }
        customerDetail.source = 'Manual';
        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({ apiName: APINAME.CUSTOMER_SAVE, parameterObject: customerDetail, showLoading: true }).then(response => {
                resolve(response);
            }, error => {
                console.error(error);
                reject(error)
            });
        });
        // call api to save customer data

    }

}
