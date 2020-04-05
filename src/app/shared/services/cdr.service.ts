// External imports
import { Injectable, ChangeDetectorRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CDRService {

  constructor() { }

  /**
   * Purpose is to Implement the Change Strategy and to Update the View Manually
   * @param cdr Instance of changeDetectorRef
   */
  public callDetectChanges(cdr: ChangeDetectorRef) {
    setTimeout(function () {
      if (!cdr['destroyed']) {
        cdr.detectChanges();
      }
    }, 1);
  }

  /**
   * Purpose is to Implement the Change Strategy and to Mark for the Check for the View update
   * @param cdr Instance of changeDetectorRef
   */
  public markForCheck(cdr: ChangeDetectorRef) {
    setTimeout(function () {
      cdr.markForCheck();
    }, 1);
  }
}
