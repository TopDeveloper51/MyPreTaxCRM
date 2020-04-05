import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from "@app/shared/services/common-api.service";
import { APINAME } from "@app/customer/customer-constants";


@Injectable()
export class CustomerService {
    constructor(private commonApiService: CommonApiService) { }

    public getSubscriptionPackageName(ShowLoadingBar?: boolean) {
        if (ShowLoadingBar === undefined) {
            ShowLoadingBar = true;
        }
        return new Promise((resolve, reject) => {
            this.commonApiService.getPromiseResponse({
                apiName: APINAME.GET_PLANLIST,
                showLoading: ShowLoadingBar
            }).then(response => {
                resolve(response);
            },
                error => {
                    reject(error);
                }
            );
        });
    }
}