// External imports
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageUtilityService {

  constructor(@Inject(PLATFORM_ID) protected platformId: object) { }

  public setItem(key: string, data: any): string {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (sessionStorage) === 'undefined') {
        console.error('Your browser does not support HTML5 sessionStorage.Try upgrading.');
        return 'Error';
      } else {
        try {
          data = JSON.stringify(data);
          sessionStorage.setItem(key, data);
          return 'Success';
        } catch (e) {
          return 'Error';
        }
      }
    }
  }

  public removeItem(key: string): string {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (sessionStorage) === 'undefined') {
        console.error('Your browser does not support HTML5 sessionStorage.Try upgrading.');
        return 'Error';
      } else {
        try {
          sessionStorage.removeItem(key);
          return 'Success';
        } catch (e) {
          return 'Error';
        }
      }
    }
  }


  public getItem(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (sessionStorage) === 'undefined') {
        return 'Error';
        // $log.error('Your browser does not support HTML5 sessionStorage.Try upgrading.');
      } else {
        try {
          return JSON.parse(sessionStorage.getItem(key));
        } catch (e) {
          return 'Error';
        }
      }
    }
  }

  public checkItem(key: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (sessionStorage) === 'undefined') {
        return false;
        // $log.error('Your browser does not support HTML5 sessionStorage.Try upgrading.');
      } else {
        try {
          if (sessionStorage[key]) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
    }
  }

  public clear(): any {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (sessionStorage) === 'undefined') {
        return 'Error';
        // $log.error('Your browser does not support HTML5 sessionStorage.Try upgrading.');
      } else {
        sessionStorage.clear();
      }
    }
  }
}
