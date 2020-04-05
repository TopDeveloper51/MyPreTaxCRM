import { Injectable } from '@angular/core';
import { APINAME } from '@app/user/user.constants';
import { CommonApiService } from '@app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  constructor(private commonApiService: CommonApiService) { }

  public getLookupForUserSearch(user:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_USER_LOOKUP,isCachable:true,parameterObject: user }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public userSearch(usersearch:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ALL_USER,parameterObject: usersearch }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public userHistory(usernamehash:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_USER_HISTORY,parameterObject: {'userNameHash':usernamehash} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
