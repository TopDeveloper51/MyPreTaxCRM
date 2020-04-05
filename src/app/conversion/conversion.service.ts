import { Injectable } from '@angular/core';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { APINAME } from '@app/conversion/conversion-constant';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {

  constructor(private commonApiService: CommonApiService) { }

  /**
   * @author shreya kanani
   * @param conversionReportObject
   * @description call api for conversion report 
   */
  public getConversionReport(conversionReportObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CONVERSION_REPORT, originKey: 'originForConversion', parameterObject: conversionReportObject, showLoading: true }).
        then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @author shreya kanani
   * @param jobDetailsObject
   * @description call api for job details 
   */
  public getConversionJobDetail(jobDetailsObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CONVERSION_JOB_DETAILS, originKey: 'originForConversion', parameterObject: jobDetailsObject, showLoading: true }).
        then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * @author shreya kanani
   * @param conversionReportObject
   * @description call api for conversion mismatch report 
   */
  public getConversionMismatchReport(conversionReportObject) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.CONVERSION_SYNC_MISMATCH_REPORT, originKey: 'originForConversionMisMatch', parameterObject: conversionReportObject, showLoading: true }).
        then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject();
          }
        }, (error) => {
          reject(error);
        });
    });
  }
}
