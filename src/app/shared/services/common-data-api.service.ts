import { Injectable } from '@angular/core';

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { UserService } from '@app/shared/services/user.service';
import { APINAME } from "@app/activity/activity-constants";


@Injectable({
  providedIn: 'root'
})
export class CommonDataApiService {

  constructor(private commonApiService: CommonApiService, private userService: UserService) { }

  /**
* @author Manali Joshi
* @createdDate 17/1/2020
* @returns Customer Details
* @memberof ActivitySearchService
*/
  public getCustomerDetails(customerId) {
    return new Promise((resolve, reject) => {
      console.log(`getCustomerDetails ${customerId}`);
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAIL, parameterObject: { 'customerID': customerId }, showLoading: false })
        .then((response) => {
          if (response) {
            let customerData = response;
            customerData.activityCustomerFinalInformation = '';
            if (customerData !== undefined && customerData != null) {
              customerData.activityCustomerFinalInformation += customerData.customerName;
              if (customerData.address1 !== '' && customerData.address1 !== undefined && customerData.address1 !== null) {
                customerData.activityCustomerFinalInformation += ', ' + customerData.address1;
              }
              if (customerData.zipCode !== '' && customerData.zipCode !== undefined && customerData.zipCode !== null) {
                customerData.activityCustomerFinalInformation += ', ' + customerData.zipCode;
              }
              if (customerData.state !== '' && customerData.state !== undefined && customerData.state !== null) {
                customerData.activityCustomerFinalInformation += ', ' + customerData.state;
              }
              if (customerData.city !== '' && customerData.city !== undefined && customerData.city !== null) {
                customerData.activityCustomerFinalInformation += ', ' + customerData.city;
              }
              if (customerData.customerNumber !== '' &&
                customerData.customerNumber !== undefined && customerData.customerNumber !== null) {
                customerData.activityCustomerFinalInformation += ' ( ' + customerData.customerNumber + ' )';
              }
            }
            if (customerData.salesProcessStatus !== undefined && customerData.salesProcessStatus === 'BlackListed') {
              customerData.showBlacklistIcon = true;
            } else {
              customerData.showBlacklistIcon = false;
            }
            if (customerData.doNotCall !== undefined && customerData.doNotCall === true &&
              (customerData.type === 'phonecall' && customerData.direction === 'out')) {
              customerData.isDoNotCall = true;
            } else {
              customerData.isDoNotCall = false;
            }
            resolve(customerData);
          } else {
            reject(false);
          }
        });
    });
  }



}
