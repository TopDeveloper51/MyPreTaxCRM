// External Imports
import { Injectable, EventEmitter } from '@angular/core';

/**
 * Getter and Setter method to Store User Details
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // private _isAuthenticated: boolean = false;
  private userDetails: any = {};
  public USER_STATUS: string;
  private lastUserPathData = '/';
  private languageToRedirectData: string;
  userStatusChanged: EventEmitter<any> = new EventEmitter();
  headerdatachange: EventEmitter<any> = new EventEmitter();
  updateReminderCountChanged: EventEmitter<any> = new EventEmitter();


  constructor() { }

  // to get flag and array of url list, this return true if flag is true
  public hideLiveCRMMenu() {
    if (this.userDetails && this.userDetails.crmAppConfig && this.userDetails.crmAppConfig.crmConfig && this.userDetails.crmAppConfig.crmConfig.hideLiveCRMMenu) {
      if (this.userDetails.crmAppConfig.crmConfig.liveCRMURLList && this.userDetails.crmAppConfig.crmConfig.liveCRMURLList.length > 0) {
        return this.userDetails.crmAppConfig.crmConfig.liveCRMURLList;
      }
    } else {
      return false;
    }
  }

  // update logged in user data
  public updateUserDetails(data: any): void {
    this.userDetails = data;
  }
  public getUserDetail(): any {
    return this.userDetails;
  }

  public get userDetail(): any {
    return this.userDetails;
  }

  public isCallOverviewUser() {
    if (this.userDetails.isCallOverviewUser !== undefined && this.userDetails.isCallOverviewUser === true) {
      return true;
    } else {
      return false;
    }
  }
  // get user data
  public getProperty(key: string): any {
    return this.userDetails[key] === undefined ? '' : this.userDetails[key];

  }

  public set userDetail(userData: any) {
    this.userDetails = userData;
    this.headerdatachange.emit(this.userDetails);
  }

  public setUserStatusChange(status) {
    this.USER_STATUS = status;
    this.userStatusChanged.emit(status);
  }

  public getUserStatusChangedEmitter() {
    return this.userStatusChanged;
  }
  public get isAuthenticated(): boolean {
    return this.userDetails.isActive;
  }

  public get lastUserPath(): string {
    return this.lastUserPathData;
  }

  public set lastUserPath(lastRouting: string) {
    this.lastUserPathData = lastRouting;
  }

  public userDetailProperty(key: string) {
    return this.userDetails[key];
  }


  public set languageToRedirect(lang: string) {
    this.languageToRedirectData = lang;
  }


  public get languageToRedirect(): string {
    return this.languageToRedirectData;
  }

  public getHeaderChangeEmitter() {
    return this.headerdatachange;
  }
  /// check default resellerid if login user have mytaxprepoffice CRM user or else
  public isDefaultReseller(): boolean {
    if (this.userDetails.resellerId !== undefined && this.userDetails.resellerId === '4dc601df-dc0e-4a7a-857d-9493ba33a223') {
      return true;
    } else {
      return false;
    }
  }
  public showFeedback(): any {
    if (this.userDetails !== undefined && this.userDetails.showFeedback !== undefined) {
      return this.userDetails.showfeedback;
    } else {
      if (this.userDetails != undefined && this.userDetails.userName !== undefined && (this.userDetails != undefined && this.userDetails.userName.toLowerCase() === 'roger.ziems') || (this.userDetails != undefined && this.userDetails.userName.toLowerCase() === 'petra.ziems')
        || (this.userDetails !== undefined && this.userDetails.userName.toLowerCase() === 'laura.hoelscher') || (this.userDetails != undefined && this.userDetails.userName.toLowerCase() === 'deepmala.chauhan')) {
        return true;
      } else {
        return false;
      }
    }
  };
  // Return resellerID Details
  public getResellerId(): string {
    localStorage.setItem('resellerId', JSON.stringify(this.userDetails.resellerId));
    return this.userDetails.resellerId;
  };

  public getUpdateReminderCount() {
    return this.updateReminderCountChanged;
  }

  public setUpdatedCount(response) {
    this.updateReminderCountChanged.emit(response);
  }

}
