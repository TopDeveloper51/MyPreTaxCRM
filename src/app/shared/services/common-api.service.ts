// External Imports
import { Injectable, EventEmitter } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// Internal Imports
import { environment } from '@environments/environment';
import { LoaderService } from '@app/shared/loader/loader.service';

@Injectable({
  providedIn: 'root'
})
export class CommonApiService {
  // Default Parameters
  httpDefaults: HTTPParam = {
    apiName: null,
    parameterObject: {},
    methodType: 'post',
    showLoading: true,
    isCachable: false,
    originKey: 'origin',
    isOffline: true
  };

  // Tracking API Calls
  apiInProcess: any = [];

  // Constructor
  constructor(private http: HttpClient,
    private loaderService: LoaderService) { }

  /**
   * Append Headers
   * @param showLoading Pass Header Whether to Show Loading On API Call
   * @param isCachable Pass Header Whether to Cached On API Call
   */
  private appendHeaders(
    showLoading: boolean,
    isCachable: boolean
  ): HttpHeaders {
    return new HttpHeaders({ 'X-Cache': isCachable.toString() });
  }

  private hideLoader(parameters: HTTPParam) {
    if (parameters.showLoading) {
      const isExists = this.apiInProcess.findIndex(
        apiName => apiName === parameters.apiName
      );
      if (isExists !== -1) {
        this.apiInProcess.splice(isExists, 1);
      }

    }
  }

  /**
   * POST REQUEST TO THE HTTP USING Observable
   * @param string apiName - API Name
   * @param [parameterObject] - Parameter to pass in request (By Default = {})
   * @returns Observable<any>
   */
  private post(
    apiName: string,
    parameterObject?: any,
    showLoading?: boolean,
    isCachable?: boolean,
    originKey?: string,
    isOffline?: boolean
  ): Observable<any> {
    const header = this.appendHeaders(showLoading, isCachable);
    return this.http.post(`${environment[originKey] + apiName}`, parameterObject, { headers: header })
      .map((res: any) => {
        if (res.data) {
          return res.data;
        } else {
          return {};
        }
      });
  }

  /**
   * GET REQUEST TO THE HTTP USING Observable
   * @param string apiName - API Name
   * @param  [parameterObject] - Parameter to pass in request (By Default = {})
   * @returns Observable<any>
   */
  private get(
    url: string,
    showLoading?: boolean,
    isCachable?: boolean,
    originKey?: string,
    responseType?: string,
    isOffline?: boolean
  ): Observable<any> {
    const header = this.appendHeaders(showLoading, isCachable);
    const headerInfo: any = { headers: header };
    //const headerInfo: any = {};
    if (responseType !== undefined && responseType !== '') {
      headerInfo.responseType = responseType;
    }
    return this.http
      .get(`${environment[originKey] + url}`, headerInfo)
      .map((res: any) => {
        if (responseType === 'blob') {
          return res;
        } else if (res) {
          return res.data || {};
        } else {
          return {};
        }
      });
  }


  /**
   * 
   * GET HTTP RESPONSE USING Observable
   * @param {string} apiName API NAME
   * @param {any} [parameterObject={}] 
   * @param {string} [methodType="post"] 
   * @param {boolean} [showLoading=true] 
   * @returns {*} 
   * @memberof CommonAPIService
   */
  public getObservableResponse(httpParam: HTTPParam): Observable<any> {
    const parameters = Object.assign({}, this.httpDefaults, httpParam);
    switch (parameters.methodType) {
      case 'post': return this.post(parameters.apiName, parameters.parameterObject, parameters.showLoading, parameters.isCachable, parameters.originKey);
      case 'get': return this.get(parameters.apiName, parameters.showLoading, parameters.isCachable, parameters.originKey);
    }
  }

  /**
   * GET HTTP RESPONSE USING Observable
   * @param string apiName API NAME
   * @param any [parameterObject={}]
   * @param string [methodType="post"]
   * @param boolean [showLoading=true]
   * @returns Observable<any>
   */
  // public getObservableResponse(httpParam: HTTPParam): Observable<any> {
  //   const parameters = Object.assign({}, this.httpDefaults, httpParam);
  //   switch (parameters.methodType) {
  //     case 'post': return this.post(parameters.apiName, parameters.parameterObject, parameters.showLoading, parameters.isCachable, parameters.originKey);
  //     case 'get': return this.get(parameters.apiName, parameters.showLoading, parameters.isCachable, parameters.originKey);
  //   }
  // }

  /**
   * GET HTTP RESPONSE USING PROMISE
   * @param string apiName API NAME
   * @param any [parameterObject={}]
   * @param string [methodType="post"]
   * @param boolean [showLoading=true]
   * @returns Promise<any>
   */
  public getPromiseResponse(httpParam: HTTPParam): Promise<any> {
    const parameters = Object.assign({}, this.httpDefaults, httpParam);
    if (parameters.showLoading) {
      this.apiInProcess.push(parameters.apiName);
      this.loaderService.show();
    }
    switch (parameters.methodType) {
      case 'post':
        return new Promise((resolve, reject) => {
          this.post(
            parameters.apiName,
            parameters.parameterObject,
            parameters.showLoading,
            parameters.isCachable,
            parameters.originKey,
            parameters.isOffline
          )
            .toPromise()
            .then(
              response => {
                if (response.data) {
                  resolve(response.data);
                } else {
                  resolve(response);
                }
                this.hideLoader(parameters);
                if (parameters.showLoading) {
                  if (this.apiInProcess && this.apiInProcess.length === 0) {
                    this.loaderService.hide();
                  }
                }
              },
              (error: HttpErrorResponse) => {
                this.hideLoader(parameters);
                if (parameters.showLoading) {
                  if (this.apiInProcess && this.apiInProcess.length === 0) {
                    this.loaderService.hide();
                  }
                }
                reject(error.error);
              }
            )
            .catch(error => {
              this.hideLoader(parameters);
              if (parameters.showLoading) {
                if (this.apiInProcess && this.apiInProcess.length === 0) {
                  this.loaderService.hide();
                }
              }
              reject(error.error);
            });
        });

      case 'get':
        return new Promise((resolve, reject) => {
          this.get(
            parameters.apiName,
            parameters.showLoading,
            parameters.isCachable,
            parameters.originKey,
            parameters.responseType,
            parameters.isOffline
          )
            .toPromise()
            .then(
              response => {
                this.hideLoader(parameters);
                resolve(response);
              },
              error => {
                this.hideLoader(parameters);
                reject(error);
              }
            )
            .catch(error => {
              this.hideLoader(parameters);
              reject(error);
            });
        });
    }
  }
}

export interface HTTPParam {
  apiName: string;
  parameterObject?: any;
  methodType?: any;
  showLoading?: boolean;
  isCachable?: boolean;
  originKey?: string;
  responseType?: string;
  isOffline?: boolean;
}
