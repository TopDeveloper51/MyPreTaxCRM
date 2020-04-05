import { Injectable } from '@angular/core';
import { CommonApiService } from '@app/shared/services';
import { APINAME } from '@app/reports/reports-constants';
@Injectable()
export class OrderOverviewService {

  constructor(private _commonAPI: CommonApiService) { }

  getLookupForOrderSearch() {
    return new Promise((resolve, reject) => {
      this._commonAPI.getPromiseResponse({ apiName: APINAME.ORDERSCREEN_GETLOOKUP }).then(response => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  getClassificationLookup() {
    return new Promise((resolve, reject) => {
      this._commonAPI.getPromiseResponse({ apiName: APINAME.GET_CLASSIFICATION_LOOKUP }).then((response) => {
        const category = [];
        for (const obj of response) {
          if (obj.id === 'trainee') {
            obj['color'] = '#009900';
          } else if (obj.id === 'professional') {
            obj['color'] = '#000000';
          } else if (obj.id === 'expert') {
            obj['color'] = '#0000FF';
          }
          category.push(obj);
        }
        resolve(category);
      }, (error) => {
        reject(error);
      });
    });
  }

  // get graph data From Api and set Options
  public orderOverviewGraph(searchableData) {
    return new Promise((resolve, reject) => {
      if (searchableData && Object.keys(searchableData) && Object.keys(searchableData).length > 0) {
        for (const key in searchableData) {
          if (!searchableData[key]) {
            delete searchableData[key];
          }
          if (key === 'category' && searchableData[key]) {
            searchableData[key] = [searchableData[key]];
          }
        }
      }
      this._commonAPI.getPromiseResponse({ apiName: APINAME.ORDER_OVERVIEW_GRAPH, parameterObject: searchableData }).then((res: any) => {
        resolve(res);
      }, (error) => {
        reject(error);
      });
    });
  }

}
