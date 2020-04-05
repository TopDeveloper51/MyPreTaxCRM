// External imports
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageUtilityService {

  constructor(@Inject(PLATFORM_ID) protected platformId: object) { }

  public addToLocalStorage(key: string, data: any): string {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (localStorage) === 'undefined') {
        return 'Error';
      } else {
        try {
          data = JSON.stringify(data);
          localStorage.setItem(key, data);
          return 'Success';
        } catch (e) {
          return 'Error';
        }
      }
    }
  }

  public removeFromLocalStorage(key: string): string {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (localStorage) === 'undefined') {
        return 'Error';
      } else {
        try {
          localStorage.removeItem(key);
          return 'Success';
        } catch (e) {
          return 'Error';
        }
      }
    }
  }


  public getFromLocalStorage(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (localStorage) === 'undefined') {
        return 'Error';
      } else {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch (e) {
          return 'Error';
        }
      }
    }
  }

  public checkLocalStorageKey(key: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (localStorage) === 'undefined') {
        return false;
      } else {
        try {
          if (localStorage[key]) {
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

  public manageLocalStorageReturnList(key: string, data: any): void {
    if (isPlatformBrowser(this.platformId)) {
      let currentData = localStorage.getItem(key);

      if (currentData == null) {
        const newList = new Array();
        newList.push(data);
        currentData = JSON.stringify(newList);
      } else {
        const currentList = JSON.parse(currentData);
        let isFound = false;
        let foundIndex;

        for (let idx = 0; idx < currentList.length; idx++) {
          if (currentList[idx].id === data.id) {
            isFound = true;
            foundIndex = idx;
            break;
          }
        }

        if (!isFound) {
          currentList.push(data);
        } else if (foundIndex !== undefined) {
          currentList.splice(foundIndex, 1, data);
        }
        currentData = JSON.stringify(currentList);
      }
      localStorage.setItem(key, currentData);
    }
  }

  public clearLocalStorage(): any {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof (localStorage) === 'undefined') {
        return 'Error';
      } else {
        localStorage.clear();
      }
    }
  }
}
