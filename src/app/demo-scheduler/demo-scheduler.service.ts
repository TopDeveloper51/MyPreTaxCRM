// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/demo-scheduler/demo-scheduler-constants';
@Injectable({
  providedIn: 'root'
})
export class DemoSchedulerService {

  constructor(private commonApiService: CommonApiService) { }


  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @description
   *        This function is used to get Training plan data.
   * @param {any} param
   *      holds start Date 
   * @memberof DemoSchedulerService
   */

  getTrainingPlan(param: any): Promise<any> {
    param.screenName = 'demoschedular';
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TRAINING_PLAN, parameterObject: param }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @description
   *        This function is used to get Training template.
   * @memberof DemoSchedulerService
   */
  getTrainingTemplate(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TRAINING_TEMPLATE, parameterObject: { screenName: 'demoschedular' }, showLoading: false }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Mkawana
   *@createdDate 25-03-2020
   * @description This function is used to create slot.
   * @memberof DemoSchedulerService
   */
  createSlot(trainingPlanner): Promise<any> {
    trainingPlanner.screenName = 'demoschedular';
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: trainingPlanner.id ? APINAME.CHANGE_SLOT_TIME : APINAME.CREATE_SLOT_TIME, parameterObject: trainingPlanner }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Mkawana
   * @createdDate 25-03-2020
   * @description This function is used to create weekly plan.
   * @memberof DemoSchedulerService
   */
  createWeekPlan(weeklyPlannerSlots): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CREATE_WEEK_PLAN, parameterObject: { 'week': weeklyPlannerSlots, needToCreatePlan: true, screenName: 'demoschedular' } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @param
   *     holds object combination of id, startdate,activityId
   * @description
   *        This function is used to unassign trainer.
   * @memberof DemoSchedulerService
   */

  unAssignTrainer(obj): Promise<any> {
    obj.screenName = 'demoschedular';
    return new Promise((resolve, reject) => {
      const self = this;
      self.commonApiService.getPromiseResponse({ apiName: APINAME.ASSIGN_TRAINER, parameterObject: obj, showLoading: false }).then(response => {
        if (response) {
          resolve(response.data);
        }
      }, (error) => {
        reject();
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @param
   *     holds object combination of id, startdate,time.
   * @description
   *        This function is used to delete data.
   * @memberof DemoSchedulerService
   */

  deleteData(data): Promise<any> {
    data.screenName = 'demoschedular';
    return new Promise((resolve, reject) => {
      const self = this;
      self.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_TRAINING_SLOT, parameterObject: data, showLoading: false }).then(response => {
        if (response) {
          resolve(response.data);
        }
      }, (error) => {
        reject(error);
      });
    });

  }


  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @description
   *        This function is on get responsible person lookup.
   * @memberof DemoSchedulerService
   */
  public getResponsiblePersonlookup(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.LOOKUP_CUSTOMER_SEARCH, parameterObject: { screenName: 'demoschedular' } }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @description
   *        This function is on get responsible person lookup.
   * @param customerId
   *      holds customer id.
   * @memberof DemoSchedulerService
   */
  getCustomerData(customerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CUSTOMER_DETAILS_BY_CUSTOMERID, parameterObject: { 'customerID': customerId, screenName: 'demoschedular' } }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Makwana
   * @createdDate 25-03-2020
   * @description
   *        This function is on save assign trainer.
   * @param customerId
   *      holds customer id.
   * @memberof DemoSchedulerService
   */
  saveAssignTrainer(slotDetails: any): Promise<any> {
    slotDetails.screenName = 'demoschedular';
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: slotDetails.activityId ? APINAME.ASSIGN_TRAINER : APINAME.SAVE_SLOT_DETAIL, parameterObject: slotDetails }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}

