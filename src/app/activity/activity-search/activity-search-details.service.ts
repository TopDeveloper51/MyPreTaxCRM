import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ActivitySearchDetailsService {

  private clientIdsObject: any = {};
  private preserveAllRowData: any = [];
  private preserveAllRowDataWithCustomerId: any = [];
  private dataLimitCount = 5;
  private indexes: any;
  private deletedIds = [];

  constructor() { }

  preserveGridData(rowData: any) {
    this.deletedIds = [];
    this.preserveAllRowData = rowData.map(obj => obj.id);
    this.preserveAllRowDataWithCustomerId = rowData.map(obj => ({ activityId: obj.id, customerId: obj.customerId }));
  }

  preserveActivityIds(clientIdInfo, id) {
    this.clientIdsObject[id] = { clientIds: clientIdInfo, currentId: id };
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

  divideInToChunk(selectedActivityId: string, needToDeleteId?: string, replaceId?: string): any {
    const range = 2 * this.dataLimitCount;
    if (this.preserveAllRowData && this.preserveAllRowData.length > 0 && selectedActivityId) {
      this.indexes = this.preserveAllRowData.findIndex(obj => obj === selectedActivityId);
      if (this.indexes > -1) {
        const prevCount = (this.indexes - this.dataLimitCount) > 0 ? (this.indexes - this.dataLimitCount - 1) : 0;
        const data = this.preserveAllRowData.slice(prevCount, this.indexes + this.dataLimitCount);
        if (replaceId && data) {
          this.clientIdsObject[replaceId].clientIds = data;
        } else {
          delete this.clientIdsObject[needToDeleteId];
          this.preserveActivityIds(data, selectedActivityId);
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

  reInitAfterSortAndFilter() {
    const currentActivityOpen = []
    for (let clientIdInfo in this.clientIdsObject) {
      if (this.clientIdsObject[clientIdInfo] && this.clientIdsObject[clientIdInfo].currentId) {
        let obj: any = { 'old': clientIdInfo, 'current': this.clientIdsObject[clientIdInfo].currentId }
        const index = this.divideInToChunk(this.clientIdsObject[clientIdInfo].currentId, clientIdInfo);
        obj.index = index;
        currentActivityOpen.push(obj);
      }
    }
    return { currentActivityIds: currentActivityOpen, deletedActivityIds: this.deletedIds };
  }

  get getActivityIds() {
    return this.clientIdsObject;
  }

  public nextAndPrevId(id, action, alradyOpenActivitys) {
    const currentActivity = [];
    for (const parentId in this.clientIdsObject) {
      if (this.clientIdsObject[parentId]) {
        currentActivity.push(this.clientIdsObject[parentId].currentId);
      }
    }
    if (this.clientIdsObject && this.clientIdsObject[id].clientIds.indexOf(this.clientIdsObject[id].currentId) > -1) {
      const index = this.clientIdsObject[id].clientIds.indexOf(this.clientIdsObject[id].currentId);
      if (action === 'next') {
        if (this.clientIdsObject[id].clientIds[index + 1]) {
          const currentId = this.clientIdsObject[id].clientIds[index + 1];
          const currentCustomerId = this.preserveAllRowDataWithCustomerId.filter(obj => obj.activityId == currentId);
          if (currentActivity.indexOf(currentId) === -1) {
            this.clientIdsObject[id].currentId = currentId
            if (index === this.clientIdsObject[id].clientIds.length - 3) {
              this.divideInToChunk(this.clientIdsObject[id].currentId, undefined, id);
            }
            let obj = { isAlreadyOpen: false, id: this.clientIdsObject[id].currentId, customerId: currentCustomerId[0].customerId }
            return obj;
          } else {
            // when activity already open then return opened activity id
            let obj = { isAlreadyOpen: true, id: currentId }
            return obj;
          }
        } else if (index === this.clientIdsObject[id].clientIds.length - 1) {
          return 0;
        }
      } else if (action === 'prev') {
        if (this.clientIdsObject[id].clientIds[index - 1]) {
          const currentId = this.clientIdsObject[id].clientIds[index - 1];
          const currentCustomerId = this.preserveAllRowDataWithCustomerId.filter(obj => obj.activityId == currentId);
          if (currentActivity.indexOf(currentId) === -1) {
            this.clientIdsObject[id].currentId = currentId;
            if (index === 3) {
              const data = this.retriveNextPrevData({ action: action, clientId: this.clientIdsObject[id].currentId })
              if (data) {
                this.divideInToChunk(this.clientIdsObject[id].currentId, undefined, id);
              }
            }
            let obj = { isAlreadyOpen: false, id: this.clientIdsObject[id].currentId, customerId: currentCustomerId[0].customerId }
            return obj;
          } else {
            // when activity already open then return opened activity id
            let obj = { isAlreadyOpen: true, id: currentId }
            return obj;
          }
        } else if (index === 0) {
          return 0;
        }
      }
    }
    return;
  }

  public retriveNextPrevData(data: any) {
    let abcd = [];
    if (data && this.preserveAllRowData && this.preserveAllRowData.length > 0) {
      const allActivtyIds = this.preserveAllRowData;
      if (data.action === 'Prev') {
        const lastindex = (allActivtyIds.indexOf(data.clientId) - 2);
        const lastIndexCount = (lastindex > 20) ? lastindex - this.dataLimitCount : 0;
        abcd = allActivtyIds.splice(lastIndexCount, this.dataLimitCount);
      } else if (data.action === 'next') {
        const nextIndex = (allActivtyIds.indexOf(data.clientId) + 2);
        const nextIndexCount = (nextIndex < allActivtyIds.length) ? allActivtyIds.length : nextIndex;
        abcd = allActivtyIds.splice(nextIndexCount, this.dataLimitCount);
      }
      return abcd;
    }
  }


}
