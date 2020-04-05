//External imports
import { Injectable } from '@angular/core';

//Internal imports
import { APINAME } from '@app/reports/reports-constants';
import { CommonApiService } from '@app/shared/services'

@Injectable({
  providedIn: 'root'
})
export class ActivitySummaryService {

  constructor(private commonApiService: CommonApiService) { }
  /**
* @author Satyam Jasoliya
* @createdDate 26/11/2019
* @discription get responsible person list
* @memberof activitySummaryComponent
*/
  public getResposiblePersonList(role: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_DAILY_USAGE_GRAPH,isCachable:true, parameterObject: role }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
  /**
* @author Satyam Jasoliya
* @createdDate 26/11/2019
* @discription get activity summary
* @memberof activitySummaryComponent
*/
  public getActivitySummary(activitySummaryData: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ACTIVITY_SUMMARY, parameterObject: activitySummaryData }).then((response) => {
        resolve(response);
      }, (error) => {
          reject(error);
        });
    });
  }
}
