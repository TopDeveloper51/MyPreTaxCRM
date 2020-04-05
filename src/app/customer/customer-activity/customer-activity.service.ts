// External imports
import { Injectable } from "@angular/core";

// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";

@Injectable()
export class CustomerActivityService {
    public activityLookup: any = {
        activitystatuslist: [],
        tagListLkp: [],
        activityTypelist: [],
        responsiblePesronList: [],
        departmentList: []
    };

    constructor(
        private commonApiService: CommonApiService,
    ) { }

    /**
     * @author Dhruvi Shah
     * @createdDate 22/10/2019
     * @returns lookup data
     * @memberof TicketSearchService
     */
    public getLookupForCustomerActivity() {
        return new Promise((resolve, reject) => {
            this.commonApiService
                .getPromiseResponse({
                    apiName: APINAME.CUSTOMER_CARD_ACTIVITY_LOOKUP,
                    isCachable:true,
                    parameterObject: {},
                    showLoading: true
                })
                .then(
                    response => {
                        if (response) {
                            this.activityLookup.activitystatuslist = response.activityStatusList;
                            this.activityLookup.tagListLkp = response.activityTagList;
                            this.activityLookup.activityTypelist = response.activityArtList;
                            this.activityLookup.responsiblePesronList = response.responsiblePesronList;
                            resolve(this.activityLookup);
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

    public getDepartmentLookUp() {
        return new Promise((resolve, reject) => {
            this.commonApiService
                .getPromiseResponse({
                    apiName: APINAME.GET_ACTIVITY_DEPARTMENT_LOOKUP,
                    isCachable:true,
                    showLoading: true
                })
                .then(
                    response => {
                        if (response) {
                            this.activityLookup.departmentList = response;
                            resolve(this.activityLookup.departmentList);
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

    // GET_CUSTOMER_ACTIVITY_SEARCH
    public getCustomerActivitySearch(data: any) {
        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_ACTIVITY_SEARCH, parameterObject: data }).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
            });
        });
    }
}
