//External imports
import { Injectable } from '@angular/core';

//Internal imports
import { APINAME } from '@app/reports/reports-constants';
import { CommonApiService } from '@app/shared/services'

@Injectable({
  providedIn: 'root'
})

export class CalendarService {

  constructor(private commonApiService: CommonApiService) { }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19//11/2019
  * @discription get responsible person list
  * @memberof caledarComponent
  */
  public getResposiblePersonList() {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GETLOOKUP,isCachable:true,parameterObject: {} }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
  * @author Satyam Jasoliya
  * @createdDate 19//11/2019
  * @discription get appointment list data
  * @memberof caledarComponent
  */
  public getAppointmentListData(data:any) {
    return new Promise((resolve, reject) => {
      this.commonApiService.getPromiseResponse({ apiName: APINAME.GET_APPOINTMENTS, parameterObject: data }).then((response) => {
        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }
}
