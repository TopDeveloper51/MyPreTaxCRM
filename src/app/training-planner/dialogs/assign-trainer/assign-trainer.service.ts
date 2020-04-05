// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/training-planner/training-planner.constants';
@Injectable({
  providedIn: 'root'
})
export class AssignTrainerService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author om kanada
   * @description
   *        This function is on get responsible person lookup.
   * @memberof AssignTrainerService
   */
  public getResponsiblePersonlookup(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.LOOKUP_CUSTOMER_SEARCH }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });

  }
  /**
   * @author om kanada
   * @description
   *        This function is on get responsible person lookup.
   * @param customerId
   *      holds customer id.
   * @memberof AssignTrainerService
   */
  getCustomerData(customerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAILS_BY_CUSTOMERID, parameterObject: { 'customerID': customerId } }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
  /**
   * @author om kanada
   * @description
   *        This function is on save assign trainer.
   * @param customerId
   *      holds customer id.
   * @memberof AssignTrainerService
   */
  saveAssignTrainer(slotDetails: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: slotDetails.activityId ? APINAME.ASSIGN_TRAINER : APINAME.SAVE_SLOT_DETAIL, parameterObject: slotDetails }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
