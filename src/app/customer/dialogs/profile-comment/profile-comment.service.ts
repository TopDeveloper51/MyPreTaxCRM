// External imports
import { Injectable } from '@angular/core';
// Internal imports
import { APINAME } from '@app/customer/customer-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';
@Injectable({
  providedIn: 'root'
})
export class ProfileCommentService {

  constructor(private commonApiService: CommonApiService) { }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is get commnet by customer id 
* @memberof ProfileCommentComponent
*/

  public getCommentById(docId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_FEEDBACK_COMMENTS, parameterObject: docId }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is used add commnet by specific customer id
* @memberof ProfileCommentComponent
*/
  public addCommentById(docId) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.ADD_COMMENT, parameterObject: docId }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
