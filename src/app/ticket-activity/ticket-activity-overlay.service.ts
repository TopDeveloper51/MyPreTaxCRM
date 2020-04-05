import { Injectable, TemplateRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { WindowRef, WindowCloseResult, WindowService } from '@progress/kendo-angular-dialog';
import { LocalStorageUtilityService, MessageService } from '@app/shared/services';
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service'
import { TicketActivityDetailComponent } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.component'

@Injectable({
  providedIn: 'root'
})


export class TicketActivityOverlayService {

  arrayList = new Subject<Object>();
  closeActivityId = new Subject<Event[]>();
  gridHighlight = new Subject<Object>();
  private openTicActIDList: any = [];
  public minimizedWindowList: any = [];
  public windowRefs: any = {};

  public clientIdsObject: any = {};
  private preserveAllRowData: any = [];
  private preserveAllRowDataWithCustomerId: any = [];
  private dataLimitCount = 5;
  private indexes: any;
  private deletedIds = [];


  constructor(private localStorageUtilityService: LocalStorageUtilityService,
    private windowService: WindowService, private messageService: MessageService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService) {
  }




  public setTicActIDList(data: any): void {
    this.openTicActIDList = data;
  }

  public getTicActIdList(): any {
    return this.openTicActIDList;
  }

  public get minimizedWindowArray() {
    return this.minimizedWindowList;
  }

  public set minimizedWindowArray(array) {
    this.minimizedWindowList = array
  }

  public getMinimizedWindowsList() {
    if (this.localStorageUtilityService.checkLocalStorageKey('openActivityTabLocalStorageData')) {
      let localStorageObject = this.localStorageUtilityService.getFromLocalStorage('openActivityTabLocalStorageData');
      for (let obj of localStorageObject) {
        this.minimizedWindowList.push({ 'windowId': obj.screen == 'activity' ? obj.activityId : obj.ticketId, 'id': obj.screen == 'activity' ? obj.activityId : obj.ticketId, 'minimizeTitle': obj.minimizeTitle, 'screen': obj.screen })
        this.openTicActIDList.push(obj.screen == 'activity' ? obj.activityId : obj.ticketId);
      }
    }
  }

  public openWindow(dialogData, from?, titlebar?: TemplateRef<any>): string {
    let div = document.getElementById('mainCRM');
    let rect = div.getBoundingClientRect();
    let navBarDiv = document.getElementById('CRMBanner');
    if (navBarDiv) { var bannerRect = navBarDiv.getBoundingClientRect(); }
    let windowId = dialogData.id ? dialogData.id : dialogData.tempId  //new Date().getTime();
    if (this.windowRefs[windowId]) {
      windowId = windowId + new Date().getTime();
    }
    this.windowRefs[windowId] = this.windowService.open({
      content: TicketActivityDetailComponent,
      keepContent: true,
      state: 'default',
      top: bannerRect ? bannerRect.height : 0,
      left: (bannerRect ? bannerRect.left + 10 : 0),
      // height: (rect.height - (bannerRect ? bannerRect.height - 5 : 0)) > 914 ? (rect.height - (bannerRect ? bannerRect.height - 5 : 0)) : 914,
      height: 914,
      width: (bannerRect ? bannerRect.width - 20 : 0),
      draggable: false
    });
    if (titlebar) {
      this.windowRefs[windowId].window.instance.titleBarTemplate = titlebar
    }
    dialogData.windowId = windowId;
    if (from == 'newTab') {
      dialogData.newTab = true;
    }
    this.windowRefs[windowId].content.instance.modelData = dialogData;
    this.windowRefs[windowId].window.onDestroy(() => {
      let index = this.openTicActIDList.indexOf(this.windowRefs[windowId].content.instance.modelData.id);
      if (index > -1) {
        this.openTicActIDList.splice(index, 1);
      }
      this.closeActivityId.next(this.windowRefs[windowId].content.instance.modelData.id)
      delete this.windowRefs[windowId];
      this.removeClientIdsOnClose(windowId) // to remove id from preserve data for nextPrev of activitySearch
    })

    /* minimize window start*/
    this.windowRefs[windowId].window.instance.stateChange.subscribe((state) => {
      if (state == "minimized") {
        this.windowRefs[windowId].window.location.nativeElement.classList.remove('show_title_bar');
        this.windowRefs[windowId].window.location.nativeElement.classList.add('no_title_bar');
        let idExists = this.minimizedWindowList.findIndex(t => t.id == this.windowRefs[windowId].content.instance.modelData.id)
        if (idExists == -1) {
          this.minimizedWindowList.push({ 'windowId': windowId, 'id': this.windowRefs[windowId].content.instance.modelData.id, 'minimizeTitle': this.windowRefs[windowId].content.instance.customerShortInfo });
        }
        this.arrayList.next({ 'list': this.minimizedWindowList, 'type': 'minimized' });

        // let openIdExists = this.openTicActIDList.findIndex(t => t == this.windowRefs[id].content.instance.modelData.id)
        // if (openIdExists > -1) {
        //   this.openTicActIDList.splice(openIdExists, 1);
        // }
      }
    })
    /* minimize window end */

    return windowId
  }

  maximizeWindow(id, screen) {
    let index = this.minimizedWindowList.findIndex(t => t.id === (this.windowRefs[id] ? this.windowRefs[id].content.instance.modelData.id : id));
    if (index > -1) {
      this.minimizedWindowList.splice(index, 1);
    }
    this.arrayList.next({ 'list': this.minimizedWindowList, 'type': 'maximized' });
    if (this.windowRefs[id]) {
      this.windowRefs[id].window.location.nativeElement.classList.remove('no_title_bar');
      this.windowRefs[id].window.location.nativeElement.classList.add('show_title_bar');
      if (this.windowRefs[id].window._component) {
        this.windowRefs[id].window._component.bringToFront(); // when activity already open then clickon next/prev then show activity in front
      }
      this.windowRefs[id].window.instance.state = 'default';
      // this.openTicActIDList.push(this.windowRefs[id].content.instance.modelData.id);
    } else {
      let idExists = this.openTicActIDList.findIndex(t => t == id)
      if (idExists == -1) {
        this.openTicActIDList.push(id);
      }
      // set dialcode when refresh tab
      let dialCode = '1';
      if (this.localStorageUtilityService.checkLocalStorageKey('openActivityTabLocalStorageData')) {
        const openedActivityList = this.localStorageUtilityService.getFromLocalStorage('openActivityTabLocalStorageData');
        for (const ids of openedActivityList) {
          if (ids.activityId === id && ids['dialCode']) {
            dialCode = ids['dialCode'];
          }
        }
      }
      let dialogData = { id: id, screen: screen, data: { 'isEmailIn': false }, dialCode: dialCode };
      let windowId = this.openWindow(dialogData);
      const indexForActivity = this.divideInToChunk(windowId, id);
      if (indexForActivity > -1) {
        this.windowRefs[windowId].content.instance.currentActivityIndex = indexForActivity + 1;
        this.windowRefs[windowId].content.instance.totalArrayLength = this.getPreserveRowDataLength();
      }
      // setTimeout(() => {
      //   const allDataLength = this.getPreserveRowDataLength();
      //   if (document.getElementById('counter_' + windowId)) {
      //     document.getElementById('counter_' + windowId).innerHTML = (indexForActivity + 1) + '/' + allDataLength;
      //   }
      // }, 3000);
    }
  }

  closeWindow(windowId, id, mode?) {
    if (!mode) {
      let index = this.minimizedWindowList.findIndex(t => t.id === id);
      if (index > -1) {
        this.minimizedWindowList.splice(index, 1);
        this.openTicActIDList.splice(index, 1)
      }

      if (this.windowRefs[windowId] && this.windowRefs[windowId].content.instance.changesSaved) {
        this.ticketActivityIntegrityService.sendMessage({ channel: 'close_window', topic: 'close_window' });
      }
      this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-overlay', topic: 'changesSaved', data: false, id: id });

      if (this.windowRefs[windowId]) {
        this.windowRefs[windowId].close();
      } else {
        this.ticketActivityIntegrityService.removeOpenActivity(id, false);
      }
    }
    this.arrayList.next({ 'list': this.minimizedWindowList, 'type': 'closed' });
  }

  closeAllWindows() {
    if (this.windowRefs && Object.keys(this.windowRefs).length > 0) {
      for (let window in this.windowRefs) {
        this.closeWindow(window, this.windowRefs[window].content.instance.modelData.id)
      }
    }
  }

  checkActivityAlreadyOpenOrNot(id, screen, isPrevNextNeeded?) {
    let index = this.openTicActIDList.indexOf(id);
    if (index > -1) {
      this.messageService.showMessage('Activity Already Open', 'info');
      this.maximizeWindow(id, screen);
      return true;
    } else {
      this.openTicActIDList.push(id);
      let dialogData = { id: id, screen: screen, isPrevNextNeeded: (isPrevNextNeeded !== undefined) ? isPrevNextNeeded : true, data: { 'isEmailIn': false } };
      let windowId = this.openWindow(dialogData);
      const indexForActivity = this.divideInToChunk(windowId, id);
      if (indexForActivity > -1) {
        this.windowRefs[windowId].content.instance.currentActivityIndex = indexForActivity + 1;
        this.windowRefs[windowId].content.instance.totalArrayLength = this.getPreserveRowDataLength();
        if (this.windowRefs[windowId].content.instance.currentActivityIndex === 1) {
          this.windowRefs[windowId].content.instance.disabledPrevButton = true;
        }
        if (this.windowRefs[windowId].content.instance.currentActivityIndex === this.windowRefs[windowId].content.instance.totalArrayLength) {
          this.windowRefs[windowId].content.instance.disabledNextButton = true;
        }
      }
      return false;
    }
  }

  nextPrevious(refrenceId, id, type: any, screen) {
    const activityWanted: any = this.nextAndPrevId(refrenceId, type);
    if (!(activityWanted && activityWanted.isAlreadyOpen)) {
      if (type == 'Prev') {
        this.windowRefs[refrenceId].content.instance.currentActivityIndex -= 1;
        if (this.windowRefs[refrenceId].content.instance.currentActivityIndex === 1) {
          this.windowRefs[refrenceId].content.instance.disabledPrevButton = true;
          this.windowRefs[refrenceId].content.instance.disabledNextButton = false;
        } else {
          this.windowRefs[refrenceId].content.instance.disabledPrevButton = false;
          this.windowRefs[refrenceId].content.instance.disabledNextButton = false;
        }
      } else if (type == 'Next') {
        this.windowRefs[refrenceId].content.instance.currentActivityIndex += 1;
        if (this.windowRefs[refrenceId].content.instance.currentActivityIndex === this.windowRefs[refrenceId].content.instance.totalArrayLength) {
          this.windowRefs[refrenceId].content.instance.disabledNextButton = true;
          this.windowRefs[refrenceId].content.instance.disabledPrevButton = false;
        } else {
          this.windowRefs[refrenceId].content.instance.disabledNextButton = false;
          this.windowRefs[refrenceId].content.instance.disabledPrevButton = false;
        }
      }
      let i = this.openTicActIDList.findIndex(openActivityId => openActivityId === id);
      if (i > -1) {
        this.openTicActIDList.splice(i, 1);
        this.gridHighlight.next({ prev: id, current: activityWanted.id });
        this.ticketActivityIntegrityService.sendMessage({ channel: 'ticket-activity-overlay', topic: screen, data: activityWanted.id, id: id });
        this.openTicActIDList.push(activityWanted.id);
      }
      this.reloadActivityWindow(refrenceId, activityWanted.id);

    } else if (activityWanted === 0) {

    } else {
      if (screen === 'activity') {
        this.messageService.showMessage('Activity Already Open', 'info');
      } else if (screen === 'ticket') {
        this.messageService.showMessage('Ticket Already Open', 'info');
      }
      this.maximizeWindow(activityWanted.currentWindowId, screen);
    }
  }

  nextAndPrevId(id, action) {
    const currentActivity = [];
    for (const parentId in this.clientIdsObject) {
      if (this.clientIdsObject[parentId]) {
        currentActivity.push(this.clientIdsObject[parentId].currentId);
      }
    }
    if (this.clientIdsObject && this.clientIdsObject[id].clientIds.findIndex(obj => obj.activityId === this.clientIdsObject[id].currentId) > -1) {
      const index = this.clientIdsObject[id].clientIds.findIndex(obj => obj.activityId === this.clientIdsObject[id].currentId);
      if (action === 'Next') {
        if (this.clientIdsObject[id].clientIds[index + 1]) {
          const currentId = this.clientIdsObject[id].clientIds[index + 1].activityId;
          const currentCustomerId = this.clientIdsObject[id].clientIds[index + 1].customerId;
          if (currentActivity.indexOf(currentId) === -1) {
            this.clientIdsObject[id].currentId = currentId
            if (index === this.clientIdsObject[id].clientIds.length - 3) {
              const data = this.retriveNextPrevData({ action: action, clientId: this.clientIdsObject[id].currentId })
              if (data) {
                this.divideInToChunk(id, this.clientIdsObject[id].currentId, undefined, id);
              }
            }
            let obj = { isAlreadyOpen: false, id: this.clientIdsObject[id].currentId, customerId: currentCustomerId }
            return obj;
          } else {
            // when activity already open then return opened activity id
            let currentWindowId: any;
            for (let obj in this.clientIdsObject) {
              if (this.clientIdsObject[obj].currentId == currentId) {
                currentWindowId = obj;
                break;
              }
            }
            let obj = { isAlreadyOpen: true, id: currentId, currentWindowId: currentWindowId }
            return obj;
          }
        } else if (index === this.clientIdsObject[id].clientIds.length - 1) {
          return 0;
        }
      } else if (action === 'Prev') {
        if (this.clientIdsObject[id].clientIds[index - 1]) {
          const currentId = this.clientIdsObject[id].clientIds[index - 1].activityId;
          const currentCustomerId = this.clientIdsObject[id].clientIds[index - 1].customerId;
          if (currentActivity.indexOf(currentId) === -1) {
            this.clientIdsObject[id].currentId = currentId;
            if (index === 3) {
              const data = this.retriveNextPrevData({ action: action, clientId: this.clientIdsObject[id].currentId })
              if (data) {
                this.divideInToChunk(id, this.clientIdsObject[id].currentId, undefined, id);
              }
            }
            let obj = { isAlreadyOpen: false, id: this.clientIdsObject[id].currentId, customerId: currentCustomerId }
            return obj;
          } else {
            // when activity already open then return opened activity idlet currentWindowId: any;
            let currentWindowId: any;
            for (let obj in this.clientIdsObject) {
              if (this.clientIdsObject[obj].currentId == currentId) {
                currentWindowId = obj;
                break;
              }
            }

            let obj = { isAlreadyOpen: true, id: currentId, currentWindowId: currentWindowId }
            return obj;
          }
        } else if (index === 0) {
          return 0;
        }
      }
    }
    return;
  }

  retriveNextPrevData(data: any) {
    let openActivityIds = [];
    if (data && this.preserveAllRowDataWithCustomerId && this.preserveAllRowDataWithCustomerId.length > 0) {
      const allActivtyIds = JSON.parse(JSON.stringify(this.preserveAllRowDataWithCustomerId));
      if (data.action === 'Prev') {
        const lastindex = (allActivtyIds.findIndex(obj => obj.activityId == data.clientId) - 2);
        const lastIndexCount = (lastindex > 20) ? lastindex - this.dataLimitCount : 0;
        openActivityIds = allActivtyIds.splice(lastIndexCount, this.dataLimitCount);
      } else if (data.action === 'Next') {
        const nextIndex = (allActivtyIds.findIndex(obj => obj.activityId == data.clientId) + 2);
        const nextIndexCount = (nextIndex < allActivtyIds.length) ? allActivtyIds.length : nextIndex;
        openActivityIds = allActivtyIds.splice(nextIndexCount, this.dataLimitCount);
      }
      return openActivityIds;
    }
  }

  refreshAfterSortAndFilter(currentActivityOpen) {
    if (currentActivityOpen) {
      for (const id of currentActivityOpen.currentActivityIds) {
        if (id.current !== id.old) {
          this.windowRefs[id.current] = this.windowRefs[id.old];
          delete this.windowRefs[id.old]
        }
      }
    }
  }

  reloadActivityWindow(refrenceActivityId, id) {
    if (id && refrenceActivityId) {
      this.windowRefs[refrenceActivityId].content.instance.modelData.id = id;
      this.windowRefs[refrenceActivityId].content.instance.reloadActivityWithDiffId();
    }
  }

  preserveGridData(rowData: any) {
    this.deletedIds = [];
    this.preserveAllRowData = rowData.map(obj => obj.id);
    this.preserveAllRowDataWithCustomerId = rowData.map(obj => ({ activityId: obj.id, customerId: obj.customerId }));
  }

  reIntializeHeaderAferSearchCriteriaChange(windowId: string, rowData: any): void {
    this.preserveGridData(rowData);
    if (windowId && this.windowRefs && this.windowRefs[windowId] && this.windowRefs[windowId].content && this.windowRefs[windowId].content.instance && rowData) {
      this.windowRefs[windowId].content.instance.totalArrayLength = this.preserveAllRowData.length;
      const activityIndex = this.divideInToChunk(windowId, windowId);
      if (activityIndex > -1) {
        this.windowRefs[windowId].content.instance.currentActivityIndex = activityIndex + 1;
        // opened Activity/Ticket on first position in RowData/GridData.
        if (this.windowRefs[windowId].content.instance.currentActivityIndex === 1) {
          this.windowRefs[windowId].content.instance.disabledPrevButton = true;
        } else {
          this.windowRefs[windowId].content.instance.disabledPrevButton = false;
        }
        // opened Activity/Ticket on last position in RowData/GridData.
        if (this.windowRefs[windowId].content.instance.currentActivityIndex === this.windowRefs[windowId].content.instance.totalArrayLength) {
          this.windowRefs[windowId].content.instance.disabledNextButton = true;
        } else {
          this.windowRefs[windowId].content.instance.disabledNextButton = false;
        }
      } else {
        // opened Activity/Ticket is not in RowData/GridData.
        this.windowRefs[windowId].content.instance.currentActivityIndex = 1;
        this.windowRefs[windowId].content.instance.totalArrayLength = 1;
        this.windowRefs[windowId].content.instance.disabledPrevButton = true;
        this.windowRefs[windowId].content.instance.disabledNextButton = true;
      }
    }
  }

  preserveActivityIds(clientIdInfo, id, windowId) {
    this.clientIdsObject[windowId] = { clientIds: clientIdInfo, currentId: id };
  }

  getPreserveGridData() {
    return this.preserveAllRowData;
  }

  getPreserveRowDataLength() {
    return this.preserveAllRowData.length;
  }

  getpreserveAllRowDataWithCustomerId() {
    return this.preserveAllRowDataWithCustomerId;
  }

  removeClientIdsOnClose(id) {
    for (const key in this.clientIdsObject) {
      if (key == id) {
        delete this.clientIdsObject[key];
      }
    }
  }

  divideInToChunk(windowId: string, selectedActivityId: string, needToDeleteId?: string, replaceId?: string): any {
    const range = 2 * this.dataLimitCount;
    if (this.preserveAllRowDataWithCustomerId && this.preserveAllRowDataWithCustomerId.length > 0 && selectedActivityId) {
      this.indexes = this.preserveAllRowDataWithCustomerId.findIndex(obj => obj.activityId === selectedActivityId);
      if (this.indexes > -1) {
        const prevCount = (this.indexes - this.dataLimitCount) > 0 ? (this.indexes - this.dataLimitCount - 1) : 0;
        const data = this.preserveAllRowDataWithCustomerId.slice(prevCount, this.indexes + this.dataLimitCount);
        if (replaceId && data) {
          this.clientIdsObject[replaceId].clientIds = data;
        } else {
          // delete this.clientIdsObject[needToDeleteId];
          this.preserveActivityIds(data, selectedActivityId, windowId);
        }
        return this.indexes;
      } else {
        this.deletedIds.push(needToDeleteId);
      }
    } else {
      for (let key in this.clientIdsObject) {
        if (this.clientIdsObject[key]) {
          this.deletedIds.push(key);
        }
      }
      this.clientIdsObject = {};
    }
  }


  internalSelection(id, wantedId) {
    let i = this.openTicActIDList.findIndex(openActivityId => openActivityId === id);
    if (i > -1) {
      this.openTicActIDList.splice(i, 1);
      this.gridHighlight.next({ prev: id, current: wantedId });
      this.openTicActIDList.push(wantedId);
    }
  }

  checkIndexForInternalNextPrevSelection(windowId, id) {
    const indexExists = this.preserveAllRowDataWithCustomerId.findIndex(obj => obj.activityId === id);
    if (indexExists > -1) {
      this.windowRefs[windowId].content.instance.currentActivityIndex = indexExists + 1;
    } else {
      this.windowRefs[windowId].content.instance.currentActivityIndex = 0;
    }
  }

  checkChanges(type, windowId, id) {
    if (this.windowRefs[windowId]) {
      this.windowRefs[windowId].content.instance.checkChanges(type);
    } else {
      this.closeWindow(windowId, id);
    }
  }

}
