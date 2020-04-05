// External imports
import { Injectable } from "@angular/core";

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable()
export class CustomerSearchService {
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

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @param {Object} searchvalue
   * @param {boolean} topEfin
   * @returns lookup- array of obj
   * @memberof CustomerSearchService
   */
  public searchData(searchvalue, isEFINSearch, topEFIN) {
    let customerSearch: any = {};
    customerSearch = JSON.parse(JSON.stringify(searchvalue));
if(!customerSearch.isTestCustomer){
  customerSearch.isTestCustomer = false
}
    if (
      customerSearch.phone !== undefined &&
      customerSearch.phone !== "" &&
      customerSearch.phone !== null
    ) {
      customerSearch.phone = customerSearch.phone.replace(/[^\w]/gi, "").trim();
    }
    (customerSearch.taxSeason = "2016");
      // (customerSearch.sortExpression = "customerName"),
      // (customerSearch.sortDirection = "asc"),
      // (customerSearch.pageNo = 1);

    if (customerSearch.salesProcessStatus && customerSearch.salesProcessStatus.length > 0) {
      let salesProcessStatus = [];
      for (const obj of customerSearch.salesProcessStatus) {
        salesProcessStatus.push({ 'id': obj });
      }
      customerSearch.salesProcessStatus = salesProcessStatus;
    }

    if (searchvalue.customerNumber) {
      customerSearch.customerNumber = customerSearch.customerNumber.toString().trim();
      customerSearch.customerNumber = customerSearch.customerNumber.toString().replace(/#/g, '');
    }
    if (customerSearch.bank && customerSearch.bank.length > 0) {
      let bank = [];
      for (const obj of customerSearch.bank) {
        bank.push({ 'id': obj });
      }
      customerSearch.bank = bank;
    }

    let apiName;
    if (isEFINSearch) {
      customerSearch.TopEFIN = topEFIN;
      apiName = APINAME.CUSTOMER_SEARCH_EFIN;
    } else {
      apiName = APINAME.CUSTOMER_SEARCH;
    }

    return new Promise((resolve, reject) => {
      this.commonApiService
        .getPromiseResponse({
          apiName: apiName,
          parameterObject: customerSearch
        })
        .then(
          response => {
            let availableCustomer;
            if (response) {
              availableCustomer = {
                data: response,
                total: response
                  ? response.length > 0
                    ? response[0].totalCount
                    : 0
                  : 0
              };
            }
            resolve(availableCustomer);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  private dropDownValueBlankInSearchScreen()
  {
    this.lookup.countryList = [];
    this.lookup.stateList = [];
    this.lookup.refundRequestFeeling = [];
    this.lookup.softwareList = [];
    this.lookup.salesProcessStatusList = [];
    this.lookup.preferredLanguageList = [];
    this.lookup.bankList = [];
    this.lookup.customerTypeList = [];
    this.lookup.resellerList = [];
    this.lookup.paymentStatusList = [];
    this.lookup.trainingStatusList = [];
    this.lookup.seasonReadinessFlagList = [];
    this.lookup.responsiblePesronList = [];
  }

  /**
   * @author Dhruvi Shah
   * @createdDate 15/10/2019
   * @returns
   * @memberof CustomerSearchService
   */
  public getLookupForCustomer() {
    this.dropDownValueBlankInSearchScreen();
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
}
