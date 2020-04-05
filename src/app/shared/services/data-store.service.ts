// External imports
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private storedData: any = {};

  constructor() { }

  /**
   * Get Stored Data by passing the key
   * @param key Name of the Key or Property to store
   */
  public getStoredData(key: string): any {
    return this.storedData[key] || undefined;
  }

  /**
   * Set Stored Data by passing the key and data
   * @param key Name of the Key or Property to store
   */
  public setData(key: string, data: any): any {
    this.storedData[key] = data;
  }

  public resetStoreData(): any {
    this.storedData = {};
  }
}
