import { Injectable } from '@angular/core';
import { APINAME } from '@app/contact/contact-constants';
import { CommonApiService } from '@app/shared/services/common-api.service';
@Injectable({
  providedIn: 'root'
})
export class ContactDetailService {

  constructor(private commonApiService: CommonApiService) { }

  public getRoleList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_ROLE_LOOKUP,isCachable:true, parameterObject: {} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getContectType() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CONTACT_TYPE_LOOKUP,isCachable:true, parameterObject: {} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getEmailStatus() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_EMAIL_STATUS_LOOKUP,isCachable:true, parameterObject: { "isRequiredBlank": true } }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public saveContact(details: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_CONTACT_DETAIL, parameterObject: details }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getContactDetails(details: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_CONTACT_DETAIL, parameterObject: details }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public emailsendOTP(details: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SEND_CODE_TO_USER_EMAIL, parameterObject: details }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public phonesendOTP(details: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SEND_SMS_TO_USER, parameterObject: details }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }


  public deleteContactDetail(deleteContact) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_CONTACT_DETAIL, parameterObject: deleteContact }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getAppUserNumber(phoneNo: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_APP_USER_PHONE_NO, parameterObject: phoneNo }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public updateAppUserNumber(phoneNo: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.SAVE_APP_USER_PHONE_NO, parameterObject: phoneNo }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
