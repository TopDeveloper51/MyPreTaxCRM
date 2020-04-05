import { Injectable } from '@angular/core';
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/assessment/assessment.constants';

@Injectable({
  providedIn: 'root'
})
export class EditExpertiseService {

  constructor(private commonApiService: CommonApiService) { }

  public getUserList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_USER_LIST,parameterObject: {} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getMasterData() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CATEGORY_MASTER_DATA,parameterObject: {} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

}
