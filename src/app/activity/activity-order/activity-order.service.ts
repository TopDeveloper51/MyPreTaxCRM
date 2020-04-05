// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/activity/activity-constants';
@Injectable()
export class ActivityOrderService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author om kanada
   * @description
   *        This function is used to get order serach lookup data.
   */
  public getLookupForOrderSearch(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.ORDERSCREEN_GETLOOKUP,isCachable:true }).then(response => {
        if (response) {
          resolve(response);
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author om kanada
   * @param orderTempSearch
   *       this parameter holdes order search data
   * @description
   *        This function is used to get order serach lookup data.
   */
  public orderSearch(orderTempSearch: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.ORDERSCREEN_SEARCH, parameterObject: orderTempSearch }).then(response => {
        if (response) {
          resolve(response);
        }
      }, (error) => {
        reject(error);
      });

    });
  }


}
