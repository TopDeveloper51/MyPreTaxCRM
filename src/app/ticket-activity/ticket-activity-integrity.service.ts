import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { LocalStorageUtilityService } from '@app/shared/services';
import * as moment from 'moment-timezone';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketActivityIntegrityService {

  private messageSource = new Subject<ITAIntegrity>();
  private activityDetails = new Subject<ITAIntegrity>();
  private preserveActivityMode: any = [];
  private activityModeSubscription: Subscription;
  public regexForGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private localStorageUtilityService: LocalStorageUtilityService) {
  }

  // Publish Postal Event, and pass message you want to broadcast
  public sendMessage(obj: ITAIntegrity): void {
    this.messageSource.next(obj);
  }

  public clearMessages() {
    this.messageSource.next();
  }

  getMessage(): Observable<any> {
    return this.messageSource.asObservable();
  }

  public setActivityDetails(obj: ITAIntegrity) {
    this.activityDetails.next(obj);
  }

  getActivityDetails(): Observable<any> {
    return this.activityDetails.asObservable();
  }


  /**
* @author Satyam Jasoliya
* @createdDate 11/12/2019
* @description this method is use to running interval every 5 second in opening activity
* @memberof TicketActivityDetailComponent
*/

  public runningIntervalJob() {
    // console.log("Interval Started");
    // this.clearAllInterval();
    this.checkActivityTabMode();
    // this.intervalForSetTimeStamp = 
    const source = interval(5000);
    this.activityModeSubscription = source.subscribe(val => this.checkActivityTabMode());
  }

  /**
 * @author Satyam Jasoliya
 * @createdDate 11/12/2019
 * @description this method is use to check activity read/write mode
 * @memberof TicketActivityDetailComponent
 */
  private checkActivityTabMode() {
    let activityTabId = this.localStorageUtilityService.getFromLocalStorage('openActivityTabLocalStorageData');
    // console.log('ACTAB', activityTabId)
    // console.log('PRTAB', this.preserveActivityMode)
    if (this.preserveActivityMode && this.preserveActivityMode.length > 0) {
      for (let activityDetail in this.preserveActivityMode) {
        if (activityTabId && activityTabId.length > 0) {
          for (let obj in activityTabId) {
            if ((activityTabId[obj].activityId && activityTabId[obj].activityId == this.preserveActivityMode[activityDetail].activityId) || (activityTabId[obj].ticketId && activityTabId[obj].ticketId == this.preserveActivityMode[activityDetail].ticketId)) {
              if ((this.preserveActivityMode[activityDetail].isViewMode == false && activityTabId[obj].isViewMode === false) || (activityTabId[obj].openAtPlaces == 0) || (this.preserveActivityMode[activityDetail].isViewMode === true && this.preserveActivityMode[activityDetail].openedAtNumber == 1)) {
                if (this.preserveActivityMode[activityDetail].isViewMode == false && activityTabId[obj].isViewMode === false && ((this.preserveActivityMode[activityDetail].hasOwnProperty('activityId') && this.preserveActivityMode[activityDetail].activityId && !activityTabId[obj].hasOwnProperty('activityId')) || (this.preserveActivityMode[activityDetail].hasOwnProperty('ticketId') && this.preserveActivityMode[activityDetail].ticketId && !activityTabId[obj].hasOwnProperty('ticketId')))) {
                  if (((activityTabId.findIndex(t => t.activityId == this.preserveActivityMode[activityDetail].activityId) > -1) && (activityTabId.findIndex(t => t.activityId == this.preserveActivityMode[activityDetail].activityId) !== JSON.parse(obj))) || ((activityTabId.findIndex(t => t.ticketId == this.preserveActivityMode[activityDetail].ticketId) > -1) && (activityTabId.findIndex(t => t.ticketId == this.preserveActivityMode[activityDetail].ticketId) !== JSON.parse(obj)))) {

                    activityTabId.splice(obj, 1);
                    this.preserveActivityMode[activityDetail].isViewMode = true;
                    if ((activityTabId.findIndex(t => t.activityId == this.preserveActivityMode[activityDetail].activityId) > -1) && (activityTabId.findIndex(t => t.activityId == this.preserveActivityMode[activityDetail].activityId) !== JSON.parse(obj))) {
                      let index = activityTabId.findIndex(t => t.activityId == this.preserveActivityMode[activityDetail].activityId)
                      activityTabId[index].openAtPlaces += 1;
                      this.preserveActivityMode[activityDetail].openedAtNumber = activityTabId[index].openAtPlaces;
                    } else if ((activityTabId.findIndex(t => t.ticketId == this.preserveActivityMode[activityDetail].ticketId) > -1) && (activityTabId.findIndex(t => t.ticketId == this.preserveActivityMode[activityDetail].ticketId) !== JSON.parse(obj))) {
                      let index = activityTabId.findIndex(t => t.ticketId == this.preserveActivityMode[activityDetail].ticketId)
                      activityTabId[index].openAtPlaces += 1;
                      this.preserveActivityMode[activityDetail].openedAtNumber = activityTabId[index].openAtPlaces;
                    }
                  } else {
                    this.preserveActivityMode[activityDetail].isViewMode = false;
                    this.preserveActivityMode[activityDetail].openedAtNumber = 1;
                    this.preserveActivityMode[activityDetail].openAtPlaces = activityTabId[obj].openAtPlaces ? activityTabId[obj].openAtPlaces : 1;
                    activityTabId[obj] = { 'activityId': (activityTabId[obj].activityId !== this.preserveActivityMode[activityDetail].activityId) ? this.preserveActivityMode[activityDetail].activityId : activityTabId[obj].activityId, 'ticketId': (activityTabId[obj].ticketId !== this.preserveActivityMode[activityDetail].ticketId) ? this.preserveActivityMode[activityDetail].ticketId : activityTabId[obj].ticketId, 'timeStamp': moment().utc().format(), 'isViewMode': false, 'screen': this.preserveActivityMode[activityDetail].screen, 'minimizeTitle': this.preserveActivityMode[activityDetail].minimizeTitle, 'openAtPlaces': this.preserveActivityMode[activityDetail].openAtPlaces ? this.preserveActivityMode[activityDetail].openAtPlaces : 1, 'dialCode': this.preserveActivityMode[activityDetail].dialcode ? this.preserveActivityMode[activityDetail].dialcode : undefined };
                  }
                } else {
                  this.preserveActivityMode[activityDetail].isViewMode = false;
                  this.preserveActivityMode[activityDetail].openedAtNumber = 1;
                  this.preserveActivityMode[activityDetail].openAtPlaces = activityTabId[obj].openAtPlaces ? activityTabId[obj].openAtPlaces : 1;
                  activityTabId[obj] = { 'activityId': (activityTabId[obj].activityId !== this.preserveActivityMode[activityDetail].activityId) ? this.preserveActivityMode[activityDetail].activityId : activityTabId[obj].activityId, 'ticketId': (activityTabId[obj].ticketId !== this.preserveActivityMode[activityDetail].ticketId) ? this.preserveActivityMode[activityDetail].ticketId : activityTabId[obj].ticketId, 'timeStamp': moment().utc().format(), 'isViewMode': false, 'screen': this.preserveActivityMode[activityDetail].screen, 'minimizeTitle': this.preserveActivityMode[activityDetail].minimizeTitle, 'openAtPlaces': this.preserveActivityMode[activityDetail].openAtPlaces ? this.preserveActivityMode[activityDetail].openAtPlaces : 1, 'dialCode': this.preserveActivityMode[activityDetail].dialcode ? this.preserveActivityMode[activityDetail].dialcode : undefined };
                }
                
                this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
              } else {
                if (!this.preserveActivityMode[activityDetail].isViewMode) {
                  this.preserveActivityMode[activityDetail].isViewMode = true;
                  activityTabId[obj].openAtPlaces += 1;
                  this.preserveActivityMode[activityDetail].openedAtNumber = activityTabId[obj].openAtPlaces;
                  this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
                }

                if (activityTabId[obj].openAtPlaces < this.preserveActivityMode[activityDetail].openAtPlaces) {
                  if (activityTabId[obj].lastLeft < this.preserveActivityMode[activityDetail].openedAtNumber) {
                    this.preserveActivityMode[activityDetail].openedAtNumber -= 1;
                  }
                }

                if (activityTabId[obj].openAtPlaces < this.preserveActivityMode[activityDetail].openedAtNumber) {
                  this.preserveActivityMode[activityDetail].openedAtNumber -= 1;
                }

                this.preserveActivityMode[activityDetail].openAtPlaces = activityTabId[obj].openAtPlaces;

              }
            } else {
              let isExists = activityTabId.findIndex(t => (t.activityId && t.activityId === this.preserveActivityMode[activityDetail].activityId) || (t.ticketId && t.ticketId == this.preserveActivityMode[activityDetail].ticketId))
              if (isExists == -1) {
                let newObj;
                this.preserveActivityMode[activityDetail].isViewMode = false;
                if (this.preserveActivityMode[activityDetail].dialerData) {
                  newObj = { 'activityId': this.preserveActivityMode[activityDetail].activityId, 'ticketId': this.preserveActivityMode[activityDetail].ticketId, 'timeStamp': moment().utc().format(), 'isViewMode': false, 'screen': this.preserveActivityMode[activityDetail].screen, 'minimizeTitle': this.preserveActivityMode[activityDetail].minimizeTitle, 'openAtPlaces': 1, 'dialCode': this.preserveActivityMode[activityDetail].dialCode };
                } else {
                  newObj = { 'activityId': this.preserveActivityMode[activityDetail].activityId, 'ticketId': this.preserveActivityMode[activityDetail].ticketId, 'timeStamp': moment().utc().format(), 'isViewMode': false, 'screen': this.preserveActivityMode[activityDetail].screen, 'minimizeTitle': this.preserveActivityMode[activityDetail].minimizeTitle, 'openAtPlaces': 1 };
                }
                activityTabId.push(newObj);
                this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
              }
              
            }
          }
        } else {
          this.preserveActivityMode[activityDetail].isViewMode = false;
          activityTabId = [{ 'activityId': this.preserveActivityMode[activityDetail].activityId, 'ticketId': this.preserveActivityMode[activityDetail].ticketId, 'timeStamp': moment().utc().format(), 'isViewMode': false, 'screen': this.preserveActivityMode[activityDetail].screen, 'minimizeTitle': this.preserveActivityMode[activityDetail].minimizeTitle, 'openAtPlaces': 1, 'dialCode': this.preserveActivityMode[activityDetail].dialcode }];
          // if (this.preserveActivityMode[activityDetail].dialerData) {
          //   activityTabId[obj]['dialerData'] = this.preserveActivityMode[activityDetail].dialerData.dialCode;
          // }
          this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
        }
        this.sendMessage({ channel: '', topic: 'TICKET_ACTIVITY_MODE', data: this.preserveActivityMode[activityDetail], id: this.preserveActivityMode[activityDetail].id })
      }
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 11/12/2019
* @description this method is use set open mode either it is write or read
* @memberof TicketActivityDetailComponent
*/
  public setOpenActivity(activityObj: any) {
    if (this.preserveActivityMode && this.preserveActivityMode.length > 0) {
      let isExistIndex = this.preserveActivityMode.findIndex(t => t.id === activityObj.id);
      if (isExistIndex === -1) {
        if (this.regexForGUID.test(activityObj.id)) {
          this.preserveActivityMode.push(activityObj);
        }
      } else {
        activityObj.isViewMode = this.preserveActivityMode[isExistIndex].isViewMode;
        this.preserveActivityMode[isExistIndex] = Object.assign(this.preserveActivityMode[isExistIndex], activityObj)
      }
    } else {
      if (this.regexForGUID.test(activityObj.id)) {
        this.preserveActivityMode.push(activityObj);
      }
    }

    if (this.preserveActivityMode && this.preserveActivityMode.length === 0) {
      if (this.activityModeSubscription) {
        this.activityModeSubscription.unsubscribe();
      }
    } else {
      if (this.activityModeSubscription) {
        this.activityModeSubscription.unsubscribe();
      }
      this.runningIntervalJob();
    }
  }

  /**
* @author Satyam Jasoliya
* @createdDate 11/12/2019
* @description this method is use to remove open activity
* @memberof TicketActivityDetailComponent
*/
  public removeOpenActivity(activityId: string, isViewMode: boolean, numberLeft?: number) {
    let activityTabId = this.localStorageUtilityService.getFromLocalStorage('openActivityTabLocalStorageData');
    if (activityTabId) {
      for (let obj in activityTabId) {
        if (numberLeft && activityTabId[obj] && activityTabId[obj].openAtPlaces > 1) {
          activityTabId[obj].openAtPlaces -= 1;
          activityTabId[obj].lastLeft = numberLeft
        } else {
          if (activityTabId[obj].activityId == activityId || activityTabId[obj].ticketId == activityId)
            activityTabId.splice(obj, 1);
        }
      }
      this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
    }

    if (this.preserveActivityMode && this.preserveActivityMode.length > 0) {
      let isExistIndex = this.preserveActivityMode.findIndex(t => t.activityId === activityId || t.ticketId == activityId);
      if (isExistIndex !== -1) {
        this.preserveActivityMode.splice(isExistIndex, 1);
      }
    }

    if (this.preserveActivityMode && this.preserveActivityMode.length === 0) {
      if (this.activityModeSubscription) {
        this.activityModeSubscription.unsubscribe();
      }
    } else {
      if (this.activityModeSubscription) {
        this.activityModeSubscription.unsubscribe();
      }
      this.runningIntervalJob();
    }

  }


  removeOpenAtPlaces(id, numberLeft) {
    let activityTabId = this.localStorageUtilityService.getFromLocalStorage('openActivityTabLocalStorageData');
    for (let obj in activityTabId) {
      if (activityTabId[obj].activityId == id || activityTabId[obj].ticketId == id) {
        activityTabId[obj].openAtPlaces -= 1;
        activityTabId[obj].lastLeft = numberLeft;
        break;
      }
    }
    this.localStorageUtilityService.addToLocalStorage('openActivityTabLocalStorageData', activityTabId);
  }

  ngOnDestroy() {
    //console.log("Service Destroy");
  }

}


export interface ITAIntegrity {
  channel: string;
  topic: string;
  data?: any;
  id?: any;
  envelope?: any;
}