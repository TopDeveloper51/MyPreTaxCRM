import { Injectable } from '@angular/core';
import { APINAME } from '@app/reports/reports-constants';
import { CommonApiService } from '@app/shared/services';


@Injectable({
  providedIn: 'root'
})
export class BreakReasonSearchService {

  constructor(private commonApiService: CommonApiService,
  ) { }

  public getBreakReasonData(data: any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_BREAK_REASON_DATA, parameterObject: data }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  public getLookupForBreak() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_LOOKUP_FOR_BREAK_EXPLANATION,isCachable:true }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
}
}

