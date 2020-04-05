// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/training-planner/training-planner.constants';
@Injectable({
  providedIn: 'root'
})
export class DailyViewService {

  constructor(private commonApiService: CommonApiService) { }


  /**
   * @author om kanada
   * @description
   *        This function is used to get Training plan data.
   * @param {any} param
   *      holds start Date 
   * @memberof DailyViewService
   */

  getTrainingPlan(param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TRAINING_PLAN, parameterObject: param }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author om kanada
   * @description
   *        This function is used to get Training template.
   * @memberof DailyViewService
   */
  getTrainingTemplate(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_TRAINING_TEMPLATE, parameterObject: {}, showLoading: false }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author Mansi Mkawana
   * @createdDate 28-11-2019
   * @description This function is used to create slot.
   * @memberof DailyViewService
   */
  createSlot(trainingPlanner): Promise<any> {
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
   * @createdDate 28-11-2019
   * @description This function is used to create weekly plan.
   * @memberof DailyViewService
   */
  createWeekPlan(weeklyPlannerSlots): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CREATE_WEEK_PLAN, parameterObject: { 'week': weeklyPlannerSlots ,  needToCreatePlan: true} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * @author om kanada
   * @param
   *     holds object combination of id, startdate,activityId
   * @description
   *        This function is used to unassign trainer.
   * @memberof DailyViewService
   */

  unAssignTrainer(obj): Promise<any> {
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
   * @author om kanada
   * @param
   *     holds object combination of id, startdate,time.
   * @description
   *        This function is used to delete data.
   * @memberof DailyViewService
   */

  deleteData(data): Promise<any> {
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



}
