import { Injectable } from '@angular/core';
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/user/user.constants';

@Injectable({
  providedIn: 'root'
})
export class UserDetailService {

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

  public saveUser(usersave:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_USER_DETAIL,parameterObject: usersave }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getuserDoc(userNameHash:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_USER_DOC,parameterObject: userNameHash }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
